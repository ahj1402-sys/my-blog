/**
 * 쿠팡 제휴 제품 자동 매칭 유틸리티
 *
 * 블로그 포스트의 제목, 내용, 태그를 분석하여
 * 관련 있는 제휴 제품을 자동으로 찾아줍니다.
 */

import { prisma } from '@/lib/prisma'

export interface AffiliateProductMatch {
  id: string
  name: string
  coupangUrl: string
  category: string
  keywords: string
  score: number // 관련도 점수 (0-100)
}

/**
 * 키워드 매칭 점수 계산
 *
 * @param text - 검색할 텍스트
 * @param keywords - 제품 키워드 (쉼표로 구분)
 * @returns 매칭 점수 (0-100)
 */
function calculateMatchScore(text: string, keywords: string): number {
  if (!text || !keywords) return 0

  const normalizedText = text.toLowerCase()
  const keywordList = keywords.toLowerCase().split(',').map(k => k.trim())

  let score = 0

  for (const keyword of keywordList) {
    if (!keyword) continue

    // 정확히 일치 (50점)
    const exactMatches = (normalizedText.match(new RegExp(`\\b${escapeRegex(keyword)}\\b`, 'g')) || []).length
    score += exactMatches * 50

    // 부분 일치 (10점)
    const partialMatches = (normalizedText.match(new RegExp(escapeRegex(keyword), 'g')) || []).length
    score += (partialMatches - exactMatches) * 10
  }

  // 최대 100점으로 제한
  return Math.min(score, 100)
}

/**
 * 정규식 특수문자 이스케이프
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 블로그 포스트 내용에 맞는 제휴 제품 찾기
 *
 * @param title - 포스트 제목
 * @param content - 포스트 내용
 * @param tags - 태그 배열
 * @param minScore - 최소 매칭 점수 (기본값: 20)
 * @param maxResults - 최대 반환 개수 (기본값: 3)
 * @returns 관련도 순으로 정렬된 제품 배열
 *
 * @example
 * ```typescript
 * const matches = await findMatchingProducts(
 *   '애플워치로 건강 관리하는 방법',
 *   '애플워치 SE를 사용해서 운동과 수면을 추적하고 있습니다.',
 *   ['애플워치', '건강', '웨어러블'],
 *   20,
 *   2
 * )
 * console.log(matches) // [{ id: '...', name: '애플워치 SE', score: 150 }, ...]
 * ```
 */
export async function findMatchingProducts(
  title: string,
  content: string,
  tags: string[] = [],
  minScore: number = 20,
  maxResults: number = 3
): Promise<AffiliateProductMatch[]> {
  try {
    // 모든 제휴 제품 가져오기
    const allProducts = await prisma.affiliateProduct.findMany({
      select: {
        id: true,
        name: true,
        coupangUrl: true,
        category: true,
        keywords: true
      }
    })

    if (allProducts.length === 0) {
      console.log('⚠️ DB에 등록된 제휴 제품이 없습니다')
      return []
    }

    // 검색 텍스트 준비 (제목 2배 가중치, 태그 1.5배 가중치)
    const searchText = `${title} ${title} ${tags.join(' ')} ${tags.join(' ')} ${content}`

    // 각 제품의 매칭 점수 계산
    const matches = allProducts.map(product => {
      const score = calculateMatchScore(searchText, product.keywords)

      return {
        ...product,
        score
      }
    })

    // 점수 필터링 및 정렬
    const filteredMatches = matches
      .filter(match => match.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)

    console.log(`🎯 제휴 제품 매칭 결과:`, {
      totalProducts: allProducts.length,
      matchedProducts: filteredMatches.length,
      topMatches: filteredMatches.map(m => ({ name: m.name, score: m.score }))
    })

    return filteredMatches
  } catch (error) {
    console.error('❌ 제휴 제품 매칭 실패:', error)
    return []
  }
}

/**
 * 특정 카테고리의 제품만 가져오기
 *
 * @param category - 카테고리명
 * @param maxResults - 최대 반환 개수
 * @returns 해당 카테고리의 제품 배열
 */
export async function getProductsByCategory(
  category: string,
  maxResults: number = 3
): Promise<AffiliateProductMatch[]> {
  try {
    const products = await prisma.affiliateProduct.findMany({
      where: { category },
      select: {
        id: true,
        name: true,
        coupangUrl: true,
        category: true,
        keywords: true
      },
      take: maxResults
    })

    return products.map(p => ({ ...p, score: 100 }))
  } catch (error) {
    console.error('❌ 카테고리별 제품 조회 실패:', error)
    return []
  }
}
