import { Metadata } from 'next'
import { siteConfig } from '@/config'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'ko' ? `개인정보처리방침 | ${siteConfig.shortName}` : `Privacy Policy | ${siteConfig.shortName}`,
    description: locale === 'ko'
      ? `${siteConfig.name}의 개인정보처리방침입니다.`
      : `Privacy Policy for ${siteConfig.name}`,
  }
}

export default async function PrivacyPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const isKorean = locale === 'ko'
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">
        {isKorean ? '개인정보처리방침' : 'Privacy Policy'}
      </h1>
      
      <div className="prose prose-lg max-w-none">
        {isKorean ? (
          <>
            <p className="text-gray-600 mb-6">시행일: 2024년 1월 1일</p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. 개인정보의 수집 및 이용 목적</h2>
              <p>{siteConfig.name}는 다음의 목적을 위하여 개인정보를 처리합니다.</p>
              <ul>
                <li>웹사이트 서비스 제공 및 개선</li>
                <li>이용자 문의 대응</li>
                <li>서비스 이용 통계 분석</li>
                <li>마케팅 및 광고 활용</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. 수집하는 개인정보의 항목</h2>
              <h3 className="text-xl font-semibold mb-2">자동으로 수집되는 정보</h3>
              <ul>
                <li>IP 주소</li>
                <li>쿠키</li>
                <li>서비스 이용 기록</li>
                <li>방문 기록</li>
                <li>불량 이용 기록</li>
                <li>기기 정보 (브라우저 종류, OS 등)</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-2 mt-4">선택적으로 수집되는 정보</h3>
              <ul>
                <li>이메일 주소 (뉴스레터 구독 시)</li>
                <li>이름 (댓글 작성 시)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. 개인정보의 보유 및 이용 기간</h2>
              <p>원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다.</p>
              <ul>
                <li>서비스 이용 기록: 3년 (통신비밀보호법)</li>
                <li>소비자 불만 또는 분쟁 처리 기록: 3년 (전자상거래법)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. 개인정보의 제3자 제공</h2>
              <p>{siteConfig.name}는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.</p>
              <ul>
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. 개인정보의 파기</h2>
              <p>개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. 이용자의 권리</h2>
              <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
              <ul>
                <li>개인정보 열람 요구</li>
                <li>오류 등이 있을 경우 정정 요구</li>
                <li>삭제 요구</li>
                <li>처리 정지 요구</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. 쿠키(Cookie)의 운용</h2>
              <p>본 사이트는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 쿠키를 사용합니다.</p>
              <ul>
                <li>쿠키 설정 거부 방법: 브라우저 설정에서 쿠키 허용 수준을 조정하실 수 있습니다.</li>
                <li>쿠키 설정을 거부하는 경우 서비스 이용에 어려움이 발생할 수 있습니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. 개인정보 보호책임자</h2>
              <p>개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
              <ul>
                <li>개인정보 보호책임자: {siteConfig.name} 운영팀</li>
                <li>이메일: {siteConfig.emails.privacy}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. 개인정보처리방침의 변경</h2>
              <p>이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
            </section>
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-6">Effective Date: January 1, 2024</p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p>We collect information to provide better services to our users.</p>
              <h3 className="text-xl font-semibold mb-2">Information automatically collected:</h3>
              <ul>
                <li>IP address</li>
                <li>Cookies</li>
                <li>Service usage records</li>
                <li>Visit history</li>
                <li>Device information (browser type, OS, etc.)</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-2 mt-4">Information you provide:</h3>
              <ul>
                <li>Email address (when subscribing to newsletter)</li>
                <li>Name (when commenting)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Information</h2>
              <p>We use the information we collect for the following purposes:</p>
              <ul>
                <li>To provide and improve our services</li>
                <li>To respond to user inquiries</li>
                <li>To analyze service usage statistics</li>
                <li>For marketing and advertising purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
              <p>We do not share personal information with companies, organizations, or individuals outside of {siteConfig.name} except in the following cases:</p>
              <ul>
                <li>With your consent</li>
                <li>For legal reasons</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
              <p>We work hard to protect our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct any errors in your information</li>
                <li>Request deletion of your information</li>
                <li>Object to processing of your information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
              <p>We use cookies to provide personalized services. You can adjust your browser settings to refuse cookies, but this may limit your ability to use some features of our service.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Contact Information</h2>
              <p>If you have any questions about this Privacy Policy, please contact us:</p>
              <ul>
                <li>Email: {siteConfig.emails.privacy}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
              <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
            </section>
          </>
        )}
      </div>
    </div>
  )
}