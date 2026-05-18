export type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
  };
};

export function detectSaveData(navigatorLike: NavigatorWithConnection | undefined = globalNavigator()): boolean {
  return navigatorLike?.connection?.saveData === true;
}

function globalNavigator() {
  if (typeof navigator === 'undefined') return undefined;
  return navigator as NavigatorWithConnection;
}
