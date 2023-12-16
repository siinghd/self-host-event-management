/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  INotification,
  NotificationModel,
} from '../../models/notification.model';
import { Query } from 'mongoose';
import { MAX_QUERY_LIMIT } from '../constants';
import { IUser } from '../../models/user.model';

interface QueryObject {
  search?: string;
  limit?: number;
  page?: number;
  populate?: string;
  select?: string;
  sort?: string;
  [key: string]: any; // You can further refine the types for other properties
}

class WhereClauseNotification {
  user: IUser | null; // Assuming 'user' is of type INotification
  base: Query<INotification[], INotification>;
  totalcountDocument: number = 0;
  bigQ: QueryObject;
  totalPages = -1;
  filteredDocumentsNumber = -1;
  page = -1;
  previousPage = -1;
  nextPage = -1;
  limit = 20;
  currentPage = 1;

  constructor(
    bigQ: QueryObject,
    firstQueryObject: QueryObject = {},
    user: IUser | null = null
  ) {
    this.base = NotificationModel.find(firstQueryObject);
    this.bigQ = bigQ;
    this.user = user;
  }

  async search(): Promise<WhereClauseNotification> {
    const searchword: Record<string, unknown> = {};
    if (this.bigQ.search) {
      // Implement search logic here
    }
    this.base = this.bigQ.select
      ? this.base.find({ ...searchword }).select(this.bigQ.select)
      : this.base.find({ ...searchword });

    return this;
  }

  filter(): WhereClauseNotification {
    const copyQ = { ...this.bigQ };

    delete copyQ.search;
    delete copyQ.limit;
    delete copyQ.page;
    delete copyQ.populate;
    delete copyQ.select;
    delete copyQ.sort;

    let stringOfCopyQ = JSON.stringify(copyQ);
    stringOfCopyQ = stringOfCopyQ.replace(
      /\b(gte|lte|gt|lt|in|ne|eq|exists)\b/g,
      (match) => `$${match}`
    );

    const jsonOfCopyQ = JSON.parse(stringOfCopyQ);

    this.base = this.base.find(jsonOfCopyQ);

    return this;
  }

  async totalDocuments(): Promise<WhereClauseNotification> {
    this.totalcountDocument = await NotificationModel.estimatedDocumentCount();
    return this;
  }

  populate(): WhereClauseNotification {
    if (this.bigQ.populate) {
      this.base = this.base.populate(this.bigQ.populate);
    }
    return this;
  }

  pager(): WhereClauseNotification {
    this.currentPage = this.bigQ.page
      ? parseInt(this.bigQ.page.toString(), 10)
      : 1;
    this.limit = this.bigQ.limit
      ? Math.min(this.bigQ.limit, MAX_QUERY_LIMIT)
      : this.limit;
    const skipVal = this.limit * (this.currentPage - 1);

    this.base = this.bigQ.sort
      ? this.base.limit(this.limit).skip(skipVal).sort(this.bigQ.sort)
      : this.base.limit(this.limit).skip(skipVal);

    return this;
  }

  async exec(): Promise<{
    documents: INotification[];
    totalDocumentsCount: number;
    previousPage: number;
    page: number;
    nextPage: number;
  }> {
    await this.totalDocuments();

    await this.search();
    this.filter();
    this.pager();
    this.populate();

    const documents = await this.base.clone();
    if (documents.length === this.limit) {
      this.nextPage = this.currentPage + 1;
    }

    return {
      documents,
      totalDocumentsCount: this.totalcountDocument,
      previousPage: this.previousPage,
      page: this.page,
      nextPage: this.nextPage,
    };
  }
}

export { WhereClauseNotification };
