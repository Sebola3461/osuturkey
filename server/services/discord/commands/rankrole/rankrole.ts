import { PermissionsBitField } from "discord.js";
import { SlashCommand } from "../../models/SlashCommand";
import rankroleAddRole from "./rankroleAddRole";
import rankroleRemoveRole from "./rankroleRemoveRole";

const rankrole = new SlashCommand(
  "rankrole",
  "Manage rank roles",
  "RankRoles",
  false,
  undefined,
  [PermissionsBitField.Flags.Administrator]
);

rankrole.addSubcommand(rankroleAddRole).addSubcommand(rankroleRemoveRole);

export default rankrole;
