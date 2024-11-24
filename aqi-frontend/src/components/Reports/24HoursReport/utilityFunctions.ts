export const calculateSlidingWindowAverage = (
    data: number[],
    windowSize: number
  ): number[] => {
    if (data.length < windowSize) {
      return []; // Not enough data points for the sliding window
    }
  
    const averages: number[] = [];
    for (let i = 0; i <= data.length - windowSize; i++) {
      const window = data.slice(i, i + windowSize);
      const average = window.reduce((sum, value) => sum + value, 0) / windowSize;
      averages.push(average);
    }
  
    return averages;
  };
  