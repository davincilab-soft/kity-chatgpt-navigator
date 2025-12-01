// Core adapter interface
export interface IAdapter {
  id: string;
  supports: {
    sidebar?: boolean;
    mainPane?: boolean;
    input?: boolean;
    userInputsNav?: boolean;
  };

  init(): void;
  dispose?(): void;

  focusSidebar?(): void;
  focusMain?(): void;

  enterUserNavMode?(): void;
  exitUserNavMode?(): void;
  nextUser?(): void;
  prevUser?(): void;

  navigateUp?(): void;
  navigateDown?(): void;
  extendSelectionUp?(): void;
  extendSelectionDown?(): void;
  jumpToFirst?(): void;
  jumpToLast?(): void;
  copySelected?(): void;
  startScroll?(direction: 'up' | 'down'): void;
  stopScroll?(): void;
}

export type CommandType =
  | 'focusSidebar'
  | 'focusMain'
  | 'navigateUp'
  | 'navigateDown'
  | 'extendSelUp'
  | 'extendSelDown'
  | 'prevUser'
  | 'nextUser'
  | 'jumpToFirst'
  | 'jumpToLast'
  | 'copySelected';
