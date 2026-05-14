import { prisma } from '@/lib/prisma'

/**
 * 중복된 포스트를 정리하는 스크립트
 * - slug를 기준으로 중복된 포스트 그룹을 찾음
 * - 각 그룹에서 가장 최신 포스트(updatedAt 기준)만 남기고 나머지 삭제
 * - 삭제된 포스트 정보를 상세히 로그로 출력
 */

async function cleanupDuplicatePosts() {
  console.log('🔍 중복 포스트 정리 스크립트 시작...\n')
  
  try {
    // 1. slug별로 그룹화하여 중복 포스트 찾기
    const duplicateGroups = await prisma.post.groupBy({
      by: ['slug'],
      _count: {
        slug: true,
      },
      having: {
        slug: {
          _count: {
            gt: 1, // 1개 초과 = 중복
          },
        },
      },
    })

    if (duplicateGroups.length === 0) {
      console.log('✅ 중복된 포스트가 없습니다!')
      return
    }

    console.log(`📊 발견된 중복 slug 수: ${duplicateGroups.length}개\n`)
    
    let totalDeleted = 0

    // 2. 각 중복 그룹에 대해 처리
    for (const group of duplicateGroups) {
      console.log(`\n📝 처리 중: slug = "${group.slug}"`)
      
      // 해당 slug의 모든 포스트 가져오기 (updatedAt 내림차순)
      const posts = await prisma.post.findMany({
        where: { slug: group.slug },
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          updatedAt: true,
          createdAt: true,
          status: true,
          views: true,
        },
      })

      console.log(`  - 총 ${posts.length}개의 중복 포스트 발견`)
      
      // 첫 번째 포스트(가장 최신)를 제외하고 나머지 삭제
      const [keepPost, ...postsToDelete] = posts
      
      console.log(`  - 유지할 포스트: ID ${keepPost.id} (업데이트: ${keepPost.updatedAt.toISOString()})`)
      console.log(`  - 삭제할 포스트 수: ${postsToDelete.length}개`)
      
      // 삭제할 포스트 상세 정보 출력
      for (const post of postsToDelete) {
        console.log(`    • ID ${post.id}: "${post.title}" (생성: ${post.createdAt.toISOString()}, 조회수: ${post.views})`)
      }
      
      // 포스트 삭제 실행
      if (postsToDelete.length > 0) {
        const deleteResult = await prisma.post.deleteMany({
          where: {
            id: {
              in: postsToDelete.map(p => p.id),
            },
          },
        })
        
        totalDeleted += deleteResult.count
        console.log(`  ✅ ${deleteResult.count}개 포스트 삭제 완료`)
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log(`🎉 정리 완료! 총 ${totalDeleted}개의 중복 포스트가 삭제되었습니다.`)
    console.log('='.repeat(50))
    
  } catch (error) {
    console.error('\n❌ 오류 발생:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트 실행
cleanupDuplicatePosts()
  .then(() => {
    console.log('\n✨ 스크립트 실행 완료!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 스크립트 실행 실패:', error)
    process.exit(1)
  })