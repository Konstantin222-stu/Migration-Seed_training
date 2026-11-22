import { Optional } from "sequelize";
import { Table, Model, PrimaryKey, AutoIncrement, Column, DataType, Unique, AllowNull, CreatedAt, UpdatedAt } from "sequelize-typescript";



interface CategoryAttributes{
    id: number,
    code: string,
    name: string,
    createdAt: Date,
    updatedAt: Date,
}

interface CategoryCreationAttributes
    extends Optional<CategoryAttributes, 'id' | 'createdAt' | 'updatedAt'>
    {}

@Table({
    tableName: 'categories',
    timestamps: true,
    underscored: true,
})

export class Category extends Model<CategoryAttributes, CategoryCreationAttributes>{
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER.UNSIGNED)
    declare id: number;

    @Unique
    @AllowNull(false)
    @Column(DataType.STRING(255))
    declare code: string;

    @AllowNull(false)
    @Column(DataType.STRING(255))
    declare name: string;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt 
    declare updatedAt: Date;
}