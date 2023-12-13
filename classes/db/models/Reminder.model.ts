import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "..";

export class Reminder extends Model<InferAttributes<Reminder>, InferCreationAttributes<Reminder, {omit: never}>> {
	declare public readonly id: number | null;

	declare public readonly reminder_datetime: Date;
	declare public readonly repeat_type: number;

	declare public readonly guild_id: string;
}

Reminder.init({
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},

	reminder_datetime: {
		type: DataTypes.DATE,
		allowNull: false
	},
	repeat_type: {
		type: DataTypes.INTEGER,
		allowNull: false
	},

	guild_id: {
		type: DataTypes.TEXT,
		allowNull: false
	}
}, { sequelize });