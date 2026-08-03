import { globalShortcut } from 'electron';
import { getSettings, HotkeySettings } from './store';
import {
  showOverlay,
  hideOverlay,
  lockOverlay,
  unlockOverlay,
  getOverlayWindow,
} from './overlay';
import { getMainWindow } from './main';

type HotkeyAction =
  | 'toggleOverlay'
  | 'nextPreset'
  | 'prevPreset'
  | 'increaseSize'
  | 'decreaseSize'
  | 'toggleVisibility'
  | 'lockOverlay'
  | 'openApp';

const registeredShortcuts: Map<string, HotkeyAction> = new Map();

function handleAction(action: HotkeyAction): void {
  const settings = getSettings();
  const crosshair = settings.get('crosshair');

  switch (action) {
    case 'toggleOverlay': {
      const overlay = getOverlayWindow();
      if (overlay && overlay.isVisible()) {
        hideOverlay();
      } else {
        showOverlay();
      }
      break;
    }

    case 'nextPreset': {
      const presets = crosshair.presets;
      if (presets.length === 0) return;
      const nextIndex = (crosshair.activePresetIndex + 1) % presets.length;
      settings.set('crosshair', { ...crosshair, activePresetIndex: nextIndex });
      const overlay = getOverlayWindow();
      if (overlay) {
        overlay.webContents.send('crosshair:update', presets[nextIndex].crosshair);
      }
      break;
    }

    case 'prevPreset': {
      const presets = crosshair.presets;
      if (presets.length === 0) return;
      const prevIndex =
        (crosshair.activePresetIndex - 1 + presets.length) % presets.length;
      settings.set('crosshair', { ...crosshair, activePresetIndex: prevIndex });
      const overlay = getOverlayWindow();
      if (overlay) {
        overlay.webContents.send('crosshair:update', presets[prevIndex].crosshair);
      }
      break;
    }

    case 'increaseSize': {
      const newSize = Math.min(100, crosshair.size + 2);
      settings.set('crosshair', { ...crosshair, size: newSize });
      const overlay = getOverlayWindow();
      if (overlay) {
        overlay.webContents.send('crosshair:update', crosshair);
      }
      break;
    }

    case 'decreaseSize': {
      const newSize = Math.max(1, crosshair.size - 2);
      settings.set('crosshair', { ...crosshair, size: newSize });
      const overlay = getOverlayWindow();
      if (overlay) {
        overlay.webContents.send('crosshair:update', crosshair);
      }
      break;
    }

    case 'toggleVisibility': {
      const overlay = getOverlayWindow();
      if (overlay) {
        if (overlay.isVisible()) {
          hideOverlay();
        } else {
          showOverlay();
        }
      }
      break;
    }

    case 'lockOverlay': {
      const overlay = getOverlayWindow();
      if (overlay) {
        const overlaySettings = settings.get('overlay');
        if (overlaySettings.locked) {
          unlockOverlay();
        } else {
          lockOverlay();
        }
      }
      break;
    }

    case 'openApp': {
      const mainWindow = getMainWindow();
      if (mainWindow) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        mainWindow.show();
        mainWindow.focus();
      }
      break;
    }
  }
}

function formatShortcutForElectron(shortcut: string): string {
  return shortcut
    .replace(/Ctrl\+/gi, 'CommandOrControl+')
    .replace(/Alt\+/gi, 'Alt+')
    .replace(/Shift\+/gi, 'Shift+')
    .replace(/Meta\+/gi, 'Super+');
}

export function registerAllHotkeys(): void {
  unregisterAllHotkeys();

  const settings = getSettings();
  const hotkeys = settings.get('hotkeys');
  const actions: HotkeyAction[] = [
    'toggleOverlay',
    'nextPreset',
    'prevPreset',
    'increaseSize',
    'decreaseSize',
    'toggleVisibility',
    'lockOverlay',
    'openApp',
  ];

  for (const action of actions) {
    const shortcut = hotkeys[action];
    if (shortcut && shortcut.trim() !== '') {
      try {
        const electronShortcut = formatShortcutForElectron(shortcut);
        const success = globalShortcut.register(electronShortcut, () => {
          handleAction(action);
        });
        if (success) {
          registeredShortcuts.set(electronShortcut, action);
        } else {
          console.warn(`Failed to register hotkey: ${shortcut} for action: ${action}`);
        }
      } catch (err) {
        console.error(`Error registering hotkey ${shortcut}:`, err);
      }
    }
  }
}

export function unregisterAllHotkeys(): void {
  for (const [shortcut] of registeredShortcuts) {
    try {
      globalShortcut.unregister(shortcut);
    } catch (err) {
      console.error(`Error unregistering hotkey ${shortcut}:`, err);
    }
  }
  registeredShortcuts.clear();
}

export function updateHotkeys(newHotkeys: HotkeySettings): void {
  const settings = getSettings();
  settings.set('hotkeys', newHotkeys);
  registerAllHotkeys();
}

export function getRegisteredShortcuts(): Map<string, HotkeyAction> {
  return new Map(registeredShortcuts);
}
