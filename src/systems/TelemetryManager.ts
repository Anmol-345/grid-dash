export class TelemetryManager {
  public hits: number = 0;
  public misses: number = 0;
  public score: number = 0;
  public streak: number = 0;
  public peakStreak: number = 0;
  private totalHitTime: number = 0;

  public get accuracy(): number {
    const total = this.hits + this.misses;
    if (total === 0) return 0;
    return Math.round((this.hits / total) * 100);
  }

  public get avgTimePerTarget(): number {
    if (this.hits === 0) return 0;
    return this.totalHitTime / this.hits;
  }

  public recordHit(timeSinceLastHit: number) {
    this.hits++;
    this.streak++;
    this.totalHitTime += timeSinceLastHit;
    if (this.streak > this.peakStreak) this.peakStreak = this.streak;

    const baseScore = 100;
    const streakBonus = Math.min(this.streak * 10, 500);
    const speedBonus = Math.max(0, 1000 - timeSinceLastHit);

    this.score += baseScore + streakBonus + Math.floor(speedBonus * 0.1);
  }

  public recordMiss() {
    this.misses++;
    this.streak = 0;
    this.score = Math.max(0, this.score - 50);
  }

  public reset() {
    this.hits = 0;
    this.misses = 0;
    this.score = 0;
    this.streak = 0;
    this.peakStreak = 0;
    this.totalHitTime = 0;
  }

  public snapshot() {
    return {
      hits: this.hits,
      misses: this.misses,
      score: this.score,
      streak: this.streak,
      peakStreak: this.peakStreak,
      accuracy: this.accuracy,
      avgTimePerTarget: this.avgTimePerTarget,
    };
  }
}

export const telemetry = new TelemetryManager();
