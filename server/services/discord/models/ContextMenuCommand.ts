import {
  ContextMenuCommandBuilder,
  GuildMember,
  MessageContextMenuCommandInteraction,
  PermissionResolvable,
  UserContextMenuCommandInteraction,
} from "discord.js";
import { SlashCommand } from "./SlashCommand";
import { LoggerService } from "../../../helpers/LoggerService";
import { checkMemberPermissions } from "../DiscordBot";
import generateErrorEmbedWithTitle from "../helpers/generateErrorEmbedWithTitle";

export type ContextMenuExecuteFunction<InteractionType> = (
  command: InteractionType
) => void;

export namespace ContextMenuType {
  export type Message = MessageContextMenuCommandInteraction;
  export type User = UserContextMenuCommandInteraction;
}

export class ContextMenuCommand<
  InteractionType
> extends ContextMenuCommandBuilder {
  private _executeFunction!: ContextMenuExecuteFunction<InteractionType>;
  public permissions: PermissionResolvable[] = [];
  public category = "General";
  public help: { [key: string]: string | string[] } = {};
  public allowDM = false;
  public names: string[] = [];
  public hasModal = false;
  public ephemeral = false;
  private Logger = new LoggerService("CommandHandler");

  constructor() {
    super();

    this.names = [this.name];
  }

  isContextMenu(): this is ContextMenuCommand<InteractionType> {
    return this instanceof ContextMenuCommand;
  }

  isSlashCommand(): this is SlashCommand {
    return this instanceof SlashCommand;
  }

  setModal(modal: boolean) {
    this.hasModal = modal;

    return this;
  }

  setEphemeral(ephemeral: boolean) {
    this.ephemeral = ephemeral;

    return this;
  }

  setPermissions(permissions: PermissionResolvable[]) {
    this.permissions = permissions;

    return this;
  }

  setExecuteFunction(fn: ContextMenuExecuteFunction<InteractionType>) {
    this._executeFunction = fn;

    return this;
  }

  setHelp(help: { [key: string | number]: string | string[] }) {
    this.help = help;

    return this;
  }

  async run(interaction: InteractionType) {
    const interactionData = interaction as
      | UserContextMenuCommandInteraction
      | MessageContextMenuCommandInteraction;

    this.Logger.printInfo(`Executing command ${interactionData.commandName}`);

    if (!this.hasModal)
      await interactionData.deferReply({ ephemeral: this.ephemeral });

    if (
      this.permissions.length != 0 &&
      !checkMemberPermissions(
        interactionData.member as GuildMember,
        this.permissions
      )
    ) {
      return interactionData.deferred
        ? interactionData.editReply({
            embeds: [generateErrorEmbedWithTitle("Missing permissions!")],
          })
        : interactionData.reply({
            embeds: [generateErrorEmbedWithTitle("Missing permissions!")],
          });
    }

    this._executeFunction(interactionData as InteractionType);

    return this;
  }
}
