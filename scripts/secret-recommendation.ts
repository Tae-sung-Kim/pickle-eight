import { adminDb } from '../src/lib/firebase-admin';
import { LottoGenerator, LottoUtils } from '../src/utils/lotto.util';
import { LottoDrawType } from '../src/types/lotto.type';
/**
 * Secret Recommendation Script
 *
 * 1. Fetches ALL lotto history from Firestore (lotto_draws).
 * 2. Calculates real frequency weights from the DB data.
 * 3. Generates 5 optimal sets using the project's own advanced algorithm.
 */
async function main() {
  console.log('🔒 Accessing Firestore for secret analysis...');
  try {
    // 1. Fetch Data
    const snapshot = await adminDb.collection('lotto_draws').get();
    if (snapshot.empty) {
      console.error('❌ No data found in lotto_draws collection.');
      process.exit(1);
    }
    const draws: LottoDrawType[] = snapshot.docs.map(
      (doc) => doc.data() as LottoDrawType
    );
    console.log(`✅ Successfully loaded ${draws.length} draw records from DB.`);
    // 2. Analyze Frequency (Hot/Cold)
    const stats = LottoUtils.computeStats(draws);
    const frequency = stats.frequencyByNumber;

    // Sort numbers by frequency to show top 5 hot numbers
    const sortedFreq = Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    console.log('\n🔥 Top 5 Hot Numbers (Historical):');
    sortedFreq.forEach(([num, count]) =>
      console.log(`   #${num}: ${count} times`)
    );
    // 3. Generate Optimal Sets
    console.log('\n🎰 Generating 5 Golden Balance Sets...');
    console.log(
      '   (Config: Sum 120-160, Max Consecutive 2, Odd 3, Hot Weight 2.0)'
    );
    const recommendations = LottoGenerator.generate(
      5,
      {
        sumMin: 120,
        sumMax: 160,
        maxConsecutive: 2,
        desiredOddCount: 3,
        minBucketSpread: 3, // at least 3 different decades
        excludeRecentNumbers: [],
      },
      {
        frequency,
        hotColdAlpha: 2.0, // Strong bias towards hot numbers
      }
    );
    // 4. Output Results
    console.log('\n✨ [SECRET RECOMMENDATION RESULTS] ✨');
    recommendations.forEach((set, index) => {
      const sum = set.numbers.reduce((a, b) => a + b, 0);
      const odd = set.numbers.filter((n) => n % 2 === 1).length;
      console.log(
        `Set ${index + 1}: [ ${set.numbers.join(', ')} ] (Sum: ${sum}, Odd: ${odd})`
      );
    });
  } catch (error) {
    console.error('❌ Error during analysis:', error);
  } finally {
    process.exit(0);
  }
}
main();
