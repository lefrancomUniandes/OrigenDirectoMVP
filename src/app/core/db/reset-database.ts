import Dexie from 'dexie';

/** La recarga va en un objeto para poder sustituirla en las pruebas: jsdom no deja espiar `location.replace`. */
export const navigation = {
  replace(url: string): void {
    location.replace(url);
  },
};

/**
 * Si la dirección trae `reset`, borra IndexedDB y recarga sin ese parámetro.
 * Tiene que correr antes de abrir la base: con la conexión abierta el
 * navegador no deja borrarla.
 */
export async function resetDatabaseIfRequested(): Promise<boolean> {
  const url = new URL(location.href);
  if (!url.searchParams.has('reset')) {
    return false;
  }
  await Dexie.delete('origen-directo');
  url.searchParams.delete('reset');
  navigation.replace(url.toString());
  return true;
}
