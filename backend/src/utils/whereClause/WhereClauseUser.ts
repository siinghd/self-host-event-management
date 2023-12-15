// base - User.find()
// base - User.find(name: {"Singh"})
import User from '../../models/user.model';
import { MAX_QUERY_LIMIT } from '../constants';

// bigQ - //search=singh&role=1&views[gte]=4000
// &views[lte]=9999&page=2&limit=5

// Possibile use can be :
/* const totalcountUser = await User.countDocuments();

    const usersObj = new WhereClause(User.find(), req.query)
    .search()
    .filter();

    let users = await usersObj.base;
    const filteredUsersNumber = users.length;

    usersObj.pager();
    users = await usersObj.base.clone();

    res.status(200).json({
        success: true,
        users,
        filteredUsersNumber,
        totalcountUser,
    });
*/
class WhereClauseUser {
  user: any;

  base: any;

  totalcountDocument: any;

  bigQ: any;

  totalPages = -1;

  filteredUsersNumber = -1;

  page = -1;

  previousPage = -1;

  nextPage = -1;

  limit = 20;

  currentPage = 1;

  constructor(bigQ: any, firstQueryObject = {}, user = null) {
    this.base = User.find(firstQueryObject);
    this.bigQ = bigQ;
    this.user = user;
  }

  search() {
    // modify this if you have more search terms in the search
    const searchword: any = {};
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

  totalDocuments() {
    this.totalcountDocument = User.estimatedDocumentCount();
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
    const totalDocumentsCount = await this.totalcountDocument;
    /*  const totalPagesCount = this.totalPages; */
    /* const { filteredDocumentsNumber } = this; */
    return {
      documents,
      totalDocumentsCount,
      /*  totalPagesCount, */
      previousPage: this.previousPage,
      page: this.page,
      nextPage: this.nextPage,
      /* filteredDocumentsNumber, */
    };
  }
}

export { WhereClauseUser };
