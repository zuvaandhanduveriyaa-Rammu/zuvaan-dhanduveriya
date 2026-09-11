-- Replace em dashes in public copy so the live catalog matches the UI.

update products
  set note = replace(note, '—', ', ')
  where note like '%—%';
