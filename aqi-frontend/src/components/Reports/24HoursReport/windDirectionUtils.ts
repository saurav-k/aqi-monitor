
export const getWindDirectionReadable = (angle: number): string => {
    if (angle >= 348.75 || angle < 11.25) return 'Wind Coming from N';
    if (angle >= 11.25 && angle < 33.75) return 'Wind Coming from NNE';
    if (angle >= 33.75 && angle < 56.25) return 'Wind Coming from NE';
    if (angle >= 56.25 && angle < 78.75) return 'Wind Coming from ENE';
    if (angle >= 78.75 && angle < 101.25) return 'Wind Coming from E';
    if (angle >= 101.25 && angle < 123.75) return 'Wind Coming from ESE';
    if (angle >= 123.75 && angle < 146.25) return 'Wind Coming from SE';
    if (angle >= 146.25 && angle < 168.75) return 'Wind Coming from SSE';
    if (angle >= 168.75 && angle < 191.25) return 'Wind Coming from S';
    if (angle >= 191.25 && angle < 213.75) return 'Wind Coming from SSW';
    if (angle >= 213.75 && angle < 236.25) return 'Wind Coming from SW';
    if (angle >= 236.25 && angle < 258.75) return 'Wind Coming from WSW';
    if (angle >= 258.75 && angle < 281.25) return 'Wind Coming from W';
    if (angle >= 281.25 && angle < 303.75) return 'Wind Coming from WNW';
    if (angle >= 303.75 && angle < 326.25) return 'Wind Coming from NW';
    if (angle >= 326.25 && angle < 348.75) return 'Wind Coming from NNW';
    return 'Unknown Wind Direction';
  };