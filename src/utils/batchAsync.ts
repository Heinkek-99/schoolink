/**
 * Execute async tasks with concurrency limit
 */
export async function batchAsync<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency = 10,
  onProgress?: (completed: number, total: number) => void,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let completed = 0;
  let index = 0;

  const runNext = async (): Promise<void> => {
    while (index < items.length) {
      const currentIndex = index++;
      results[currentIndex] = await fn(items[currentIndex], currentIndex);
      completed++;
      onProgress?.(completed, items.length);
    }
  };

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => runNext());
  await Promise.all(workers);
  return results;
}
