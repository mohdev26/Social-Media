import {
  HydratedDocument,
  MongooseUpdateQueryOptions,
  ProjectionType,
  QueryOptions,
  SaveOptions,
  UpdateQuery,
  UpdateWriteOpResult,
  Model,
  QueryFilter,
  PopulateOptions,
  AnyKeys,
} from "mongoose";

export abstract class DatabaseRepository<TDocument> {
  constructor(protected readonly model: Model<TDocument>) {}

  async findOne({
    filter,
    select,
    options,
  }: {
    filter: QueryFilter<TDocument>;
    select?: ProjectionType<TDocument> | null;
    options?: QueryOptions<TDocument> | null;
  }) {
    const doc = this.model.findOne(filter).select(select || "");
    if (options?.populate) {
      doc.populate(options.populate as PopulateOptions[]);
    }
    return await doc.exec();
  }

  async findById({
    id,
    select,
    options,
  }: {
    id: string;
    select?: ProjectionType<TDocument> | null;
    options?: QueryOptions<TDocument> | null;
  }) {
    const doc = this.model.findById(id).select(select || "");
    if (options?.populate) {
      doc.populate(options.populate as PopulateOptions[]);
    }
    return await doc.exec();
  }

  async create({
    data,
    options,
  }: {
    data: Partial<TDocument>[] | Partial<TDocument>;
    options?: SaveOptions | undefined;
  }): Promise<HydratedDocument<TDocument>[] | undefined> {
    return await this.model.create(data as any, options);
  }
  async insertMany({
    data,
  }:{
data: AnyKeys<TDocument>[];
  }) {
    return await this.model.insertMany(data as any);
  }

  async updateOne({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TDocument>;
    update: UpdateQuery<TDocument>;
    options?: MongooseUpdateQueryOptions;
  }): Promise<UpdateWriteOpResult> {
    return await this.model.updateOne(filter, update, options);
  }

  async find({
    filter,
    select,
    options,
  }: {
    filter?: QueryFilter<TDocument>;
    select?: ProjectionType<TDocument>;
    options?: QueryOptions<TDocument>;
    populate?: PopulateOptions | PopulateOptions[];
  }): Promise<HydratedDocument<TDocument>[]> {
    return await this.model.find(filter ?? {}, select, options);
  }

}
