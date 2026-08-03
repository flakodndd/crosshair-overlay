import type { HotkeyConfig } from '../types';

export function formatHotkey(hotkey: HotkeyConfig): string {
  const parts: string[] = [];

  if (hotkey.ctrl) parts.push('Ctrl');
  if (hotkey.shift) parts.push('Shift');
  if (hotkey.alt) parts.push('Alt');

  const keyDisplay = formatKeyName(hotkey.key);
  parts.push(keyDisplay);

  return parts.join(' + ');
}

function formatKeyName(key: string): string {
  const keyMap: Record<string, string> = {
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
    Space: 'Space',
    Enter: 'Enter',
    Escape: 'Esc',
    Backspace: 'Backspace',
    Delete: 'Delete',
    Tab: 'Tab',
    CapsLock: 'CapsLock',
    ShiftLeft: 'L-Shift',
    ShiftRight: 'R-Shift',
    ControlLeft: 'L-Ctrl',
    ControlRight: 'R-Ctrl',
    AltLeft: 'L-Alt',
    AltRight: 'R-Alt',
    MetaLeft: 'L-Meta',
    MetaRight: 'R-Meta',
    F1: 'F1',
    F2: 'F2',
    F3: 'F3',
    F4: 'F4',
    F5: 'F5',
    F6: 'F6',
    F7: 'F7',
    F8: 'F8',
    F9: 'F9',
    F10: 'F10',
    F11: 'F11',
    F12: 'F12',
    Digit0: '0',
    Digit1: '1',
    Digit2: '2',
    Digit3: '3',
    Digit4: '4',
    Digit5: '5',
    Digit6: '6',
    Digit7: '7',
    Digit8: '8',
    Digit9: '9',
    Minus: '-',
    Equal: '=',
    BracketLeft: '[',
    BracketRight: ']',
    Backslash: '\\',
    Semicolon: ';',
    Quote: "'",
    Backquote: '`',
    Comma: ',',
    Period: '.',
    Slash: '/',
  };

  return keyMap[key] || key.replace('Key', '').replace('Numpad', 'Num');
}

export function parseHotkey(code: string): HotkeyConfig {
  const parts = code.split('+').map((s) => s.trim());

  const hotkey: HotkeyConfig = {
    action: '',
    key: '',
    ctrl: false,
    shift: false,
    alt: false,
  };

  for (const part of parts) {
    const lower = part.toLowerCase();
    if (lower === 'ctrl' || lower === 'control') {
      hotkey.ctrl = true;
    } else if (lower === 'shift') {
      hotkey.shift = true;
    } else if (lower === 'alt') {
      hotkey.alt = true;
    } else {
      hotkey.key = part;
    }
  }

  return hotkey;
}

export function hotkeyToString(hotkey: HotkeyConfig): string {
  const parts: string[] = [];

  if (hotkey.ctrl) parts.push('ctrl');
  if (hotkey.shift) parts.push('shift');
  if (hotkey.alt) parts.push('alt');

  parts.push(hotkey.key.toLowerCase());

  return parts.join('+');
}

export function stringToHotkey(str: string): HotkeyConfig {
  const parts = str.split('+').map((s) => s.trim());

  const hotkey: HotkeyConfig = {
    action: '',
    key: '',
    ctrl: false,
    shift: false,
    alt: false,
  };

  for (const part of parts) {
    const lower = part.toLowerCase();
    if (lower === 'ctrl' || lower === 'control') {
      hotkey.ctrl = true;
    } else if (lower === 'shift') {
      hotkey.shift = true;
    } else if (lower === 'alt') {
      hotkey.alt = true;
    } else {
      hotkey.key = part;
    }
  }

  return hotkey;
}

export function checkConflict(
  hotkey: HotkeyConfig,
  existing: HotkeyConfig[]
): string | null {
  if (!hotkey.key) return null;

  for (const existingHotkey of existing) {
    if (
      existingHotkey.key.toLowerCase() === hotkey.key.toLowerCase() &&
      existingHotkey.ctrl === hotkey.ctrl &&
      existingHotkey.shift === hotkey.shift &&
      existingHotkey.alt === hotkey.alt
    ) {
      return existingHotkey.action;
    }
  }

  return null;
}

export function registerGlobalShortcut(
  hotkey: HotkeyConfig,
  callback: () => void
): void {
  if (typeof window !== 'undefined' && (window as any).electronAPI) {
    (window as any).electronAPI.registerShortcut(
      hotkeyToString(hotkey),
      callback
    );
  }
}

export function unregisterGlobalShortcut(hotkey: HotkeyConfig): void {
  if (typeof window !== 'undefined' && (window as any).electronAPI) {
    (window as any).electronAPI.unregisterShortcut(hotkeyToString(hotkey));
  }
}

export function registerLocalHotkey(
  hotkey: HotkeyConfig,
  callback: () => void
): () => void {
  const handler = (event: KeyboardEvent) => {
    if (
      event.ctrlKey === hotkey.ctrl &&
      event.shiftKey === hotkey.shift &&
      event.altKey === hotkey.alt &&
      event.code.toLowerCase() === hotkey.key.toLowerCase()
    ) {
      event.preventDefault();
      event.stopPropagation();
      callback();
    }
  };

  document.addEventListener('keydown', handler);

  return () => {
    document.removeEventListener('keydown', handler);
  };
}
