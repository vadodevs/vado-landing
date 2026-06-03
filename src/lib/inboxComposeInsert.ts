/** Inserta texto en un input respetando la posición del cursor. */
export function insertTextAtComposeInput(
  input: HTMLInputElement | null,
  current: string,
  insert: string,
  setValue: (next: string) => void,
): void {
  if (!insert) return;
  if (!input) {
    setValue(current + insert);
    return;
  }
  const start = input.selectionStart ?? current.length;
  const end = input.selectionEnd ?? current.length;
  const next = current.slice(0, start) + insert + current.slice(end);
  setValue(next);
  const pos = start + insert.length;
  requestAnimationFrame(() => {
    input.focus();
    input.setSelectionRange(pos, pos);
  });
}
