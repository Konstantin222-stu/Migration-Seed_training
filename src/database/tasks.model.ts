import { Optional } from "sequelize";
import { Table, Model, PrimaryKey, AutoIncrement, Column, DataType, Unique, AllowNull, CreatedAt, UpdatedAt, ForeignKey, Default, BelongsTo } from "sequelize-typescript";
import { Category } from "./categories.model";



interface TaskAttributes{
    id: number,
    categoryId: number,
    title: string,
    isDone: boolean,
    dueAt:Date | null,
    createdAt: Date,
    updatedAt: Date,
}

interface TaskCreationAttributes
    extends Optional<TaskAttributes, 'id' | 'dueAt' | 'isDone' | 'createdAt' | 'updatedAt'>
    {}

@Table({
    tableName: 'tasks',
    timestamps: true,
    underscored: true,
})

export class Task extends Model<TaskAttributes, TaskCreationAttributes>{
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER.UNSIGNED)
    declare id: number;

    @ForeignKey(() => Category)
    @AllowNull(false)
    @Column(DataType.INTEGER.UNSIGNED)
    declare categoryId: number;

    @BelongsTo(() => Category)
    declare category: Category

    @AllowNull(false)
    @Column(DataType.STRING(255))
    declare title: string;

    @Default(false)
    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    declare isDone: boolean;

    @Default(null)
    @AllowNull(true)
    @Column(DataType.DATE)
    declare dueAt: Date | null;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt 
    declare updatedAt: Date;
}