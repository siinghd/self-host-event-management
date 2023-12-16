/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import { IUser, UserModel } from '../../models/user.model'; // Assuming IUser is your User model interface
import { MAX_QUERY_LIMIT } from '../constants';

interface QueryOptions {
  search?: {
    name?: string;
    uid?: string;
  };
  select?: string;
  populate?: string;
  sort?: string;
  page?: string;
  limit?: number;
  [key: string]: any;

}

class WhereClauseUser {
  base: mongoose.Query<IUser[], IUser>;
  bigQ: QueryOptions;
  user: IUser | null;
  totalCountDocument: number = 0; 
  totalPages = -1;
  filteredUsersNumber = -1;
  page = -1;
  previousPage = -1;
  nextPage = -1;
  limit = 20;
  currentPage = 1;

  constructor(
    bigQ: QueryOptions,
    firstQueryObject = {},
    user: IUser | null = null
  ) {
    this.base = UserModel.find(firstQueryObject);
    this.bigQ = bigQ;
    this.user = user;
  }
  search() {
    // modify this if you have more search terms in the search
    const searchword: { [key: string]: any } = {};
    if (this.bigQ.search) {
      if (this.bigQ.search.name) {
        searchword.name = {
          $regex: this.bigQ.search.name,
          $options: 'i',
        };
      }
      // if (this.bigQ.search.role) {
      //   searchword.role = {
      //     $regex: this.bigQ.search.role,
      //     $options: 'i',
      //   };
      // }
      if (this.bigQ.search.uid) {
        searchword.uid = {
          $regex: this.bigQ.search.uid,
          $options: 'i',
        };
      }
    }

    this.base =
      this.bigQ.select &&
      !this.bigQ.select.includes('password') &&
      !this.bigQ.select.includes('tokens')
        ? this.base.find({ ...searchword }).select(this.bigQ.select)
        : this.base.find({ ...searchword });

    return this;
  }

  filter() {
    const copyQ = { ...this.bigQ };

    delete copyQ.search;
    delete copyQ.limit;
    delete copyQ.page;
    delete copyQ.populate;
    delete copyQ.select;
    delete copyQ.sort;
    // convert bigQ into a string => copyQ
    let stringOfCopyQ = JSON.stringify(copyQ);

    // replace key with $key => key = gte => $gte
    stringOfCopyQ = stringOfCopyQ.replace(
      /\b(gte|lte|gt|lt|in|ne|eq|exists)\b/g,
      (m) => `$${m}`
    );

    const jsonOfCopyQ = JSON.parse(stringOfCopyQ);

    this.base = this.base.find(jsonOfCopyQ);

    return this;
  }

  async totalDocuments() {
    this.totalCountDocument = await this.base.estimatedDocumentCount();
    return this;
  }

  populate() {
    if (this.bigQ.populate) {
      this.base = this.base.populate(this.bigQ.populate);
    }
    return this;
  }

  /*   populate() {
    if (this.bigQ.populate) {
      let stringOfCopyQ = JSON.stringify(this.bigQ.populate);
      stringOfCopyQ = stringOfCopyQ.replace(
        /\b(gte|lte|gt|lt|in)\b/g,
        (m) => `$${m}`
      );

      if (stringOfCopyQ.includes('userId')) {
        return this;
      }
      const jsonOfCopyQ = JSON.parse(stringOfCopyQ);
      this.base = this.base.populate(jsonOfCopyQ);
    }
    return this;
  } */
  pager() {
    this.currentPage = 1;
    if (this.bigQ.page) {
      this.currentPage = parseInt(this.bigQ.page, 10);
    }
    if (this.bigQ.limit) {
      this.limit = Math.min(this.bigQ.limit, MAX_QUERY_LIMIT);
    }
    const skipVal = this.limit * Math.max(0, this.currentPage - 1);

    this.base = this.bigQ.sort
      ? this.base.limit(this.limit).skip(skipVal).sort(this.bigQ.sort)
      : this.base.limit(this.limit).skip(skipVal);

    /*  this.totalPages = Math.ceil(this.filteredDocumentsNumber / limit); */
    this.page = this.currentPage;
    this.previousPage = Math.max(1, this.page - 1);
    /* this.nextPage = Math.min(this.page + 1, this.totalPages); */

    return this;
  }

  async exec() {
    this.totalDocuments();

    this.search();

    this.filter();

    /*     this.filteredDocumentsNumber = await this.base
      .clone()
      .lean()
      .countDocuments(); */

    this.pager();
    this.populate();
    // https://stackoverflow.com/a/69430142/16580493 for why .clone
    const documents = await this.base.clone();
    if (documents.length === this.limit) {
      this.nextPage = this.currentPage + 1;
    }

    /*  const totalPagesCount = this.totalPages; */
    /* const { filteredDocumentsNumber } = this; */
    return {
      documents,
      totalCountDocument: this.totalCountDocument,
      /*  totalPagesCount, */
      previousPage: this.previousPage,
      page: this.page,
      nextPage: this.nextPage,
      /* filteredDocumentsNumber, */
    };
  }
}

export { WhereClauseUser };
