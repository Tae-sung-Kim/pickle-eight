import { where } from 'firebase/firestore';
import { queryDocuments } from './firebase.service';
import { FourIdiomType } from '@/types';
import { FOUR_IDIOMS_COLLECTION } from '@/constants/four-idiom-quiz.constant';

/**
 * 난이도에 맞는 사자성어 목록을 가져옵니다.
 * @param difficulty - 난이도 ('easy', 'normal', 'hard')
 * @returns 사자성어 객체 배열
 */
export const getFourIdiomsByDifficulty = async (
  difficulty: FourIdiomType['difficulty']
): Promise<FourIdiomType> => {
  try {
    const idioms = await queryDocuments<FourIdiomType>(
      FOUR_IDIOMS_COLLECTION,
      where('difficulty', '==', difficulty)
    );

    const selectIdom = idioms[Math.floor(Math.random() * idioms.length)];

    return selectIdom;
  } catch (error) {
    console.error(
      `[FOUR_IDIOM_SERVICE] Error fetching idioms by difficulty: ${difficulty}`,
      error
    );
    throw new Error('사자성어 데이터를 가져오는 데 실패했습니다.');
  }
};
