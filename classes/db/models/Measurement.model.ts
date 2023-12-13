import { Model, InferAttributes, InferCreationAttributes, DataTypes } from "sequelize";
import { sequelize } from "..";

export class Measurement extends Model<InferAttributes<Measurement>, InferCreationAttributes<Measurement, {omit: never}>> {
	declare public readonly id: number | null;

	declare public readonly name: string;
	declare public readonly multiplier: number;

	declare public readonly guild_id: string;
}

Measurement.init({
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},

	name: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	multiplier: {
		type: DataTypes.DOUBLE,
		allowNull: false
	},

	guild_id: {
		type: DataTypes.TEXT,
		allowNull: false
	}
}, { sequelize });