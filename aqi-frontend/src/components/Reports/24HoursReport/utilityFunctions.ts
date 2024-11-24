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
  

  export const reduceAndCalculateAverage = (data: number[]): number[] => {
    const reductionFactor = 5; // Number of data points to average
    const reducedAverages: number[] = [];
  
    for (let i = 0; i < data.length; i += reductionFactor) {
      const window = data.slice(i, i + reductionFactor);
      const average = window.reduce((sum, value) => sum + value, 0) / window.length;
      reducedAverages.push(average);
    }
  
    return reducedAverages;
  };
  