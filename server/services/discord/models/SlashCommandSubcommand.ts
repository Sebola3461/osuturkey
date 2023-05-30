import {
  ChatInputCommandInteraction,
  GuildMember,
  PermissionResolvable,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { ISlashCommandExecuteFunction } from "./SlashCommand";
import { checkMemberPermissions } from "../DiscordBot";
import generateErrorEmbedWithTitle from "../helpers/generateErrorEmbedWithTitle";
export class SlashCommandSubcommand {
  private _executeFunction!: ISlashCommandExecuteFunction;
  public allowDM = false;
  public help: { [key: string]: string | string[] } = {};
  public permissions: PermissionResolvable[] = [];
  public builder = new SlashCommandSubcommandBuilder();
  public hasModal: boolean;
  public ephemeral: boolean = false;

  constructor(
    name: string,
    description: string,
    help?: { [key: string | number]: string | string[] },
    permissions?: PermissionResolvable[],
    hasModal?: boolean,
    ephemeral?: boolean
  ) {
    this.builder.setName(name);
    this.builder.setDescription(description);

    this.hasModal = hasModal || false;
    this.ephemeral = ephemeral || false;

    this.help = Object.assign({ description: description }, help);

    if (permissions) this.permissions = permissions;
  }

  setHelp(help: { [key: string | number]: string | string[] }) {
    this.help = help;
  }

  setExecuteFunction(fn: ISlashCommandExecuteFunction) {
    this._executeFunction = fn;

    return this;
  }

  async run(interaction: ChatInputCommandInteraction) {
    if (!this.hasModal)
      await interaction.deferReply({ ephemeral: this.ephemeral });

    if (
      this.permissions.length != 0 &&
      !checkMemberPermissions(
        interaction.member as GuildMember,
        this.permissions
      )
    ) {
      return interaction.deferred
        ? interaction.editReply({
            embeds: [generateErrorEmbedWithTitle("Missing permissions!")],
          })
        : interaction.reply({
            embeds: [generateErrorEmbedWithTitle("Missing permissions!")],
          });
    }

    this._executeFunction(interaction);
  }
}
