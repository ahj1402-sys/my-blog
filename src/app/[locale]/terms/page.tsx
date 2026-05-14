import { Metadata } from 'next'
import { siteConfig } from '@/config'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'ko' ? `이용약관 | ${siteConfig.shortName}` : `Terms of Service | ${siteConfig.shortName}`,
    description: locale === 'ko'
      ? `${siteConfig.name}의 이용약관입니다.`
      : `Terms of Service for ${siteConfig.name}`,
  }
}

export default async function TermsPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const isKorean = locale === 'ko'
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">
        {isKorean ? '이용약관' : 'Terms of Service'}
      </h1>
      
      <div className="prose prose-lg max-w-none">
        {isKorean ? (
          <>
            <p className="text-gray-600 mb-6">시행일: 2024년 1월 1일</p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">제1조 (목적)</h2>
              <p>이 약관은 {siteConfig.name}(이하 &quot;블로그&quot;라 합니다)가 제공하는 블로그 서비스(이하 &quot;서비스&quot;라 합니다)의 이용과 관련하여 블로그와 이용자의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">제2조 (용어의 정의)</h2>
              <ol>
                <li>&quot;블로그&quot;란 {siteConfig.name} 웹사이트를 말합니다.</li>
                <li>"이용자"란 블로그에 접속하여 이 약관에 따라 블로그가 제공하는 서비스를 받는 자를 말합니다.</li>
                <li>"콘텐츠"란 블로그가 제공하는 모든 글, 이미지, 동영상 등을 말합니다.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">제3조 (약관의 게시와 개정)</h2>
              <ol>
                <li>블로그는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</li>
                <li>블로그는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</li>
                <li>약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 블로그의 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">제4조 (서비스의 제공)</h2>
              <p>블로그는 다음과 같은 서비스를 제공합니다:</p>
              <ol>
                <li>블로그 콘텐츠 열람 서비스</li>
                <li>댓글 작성 서비스</li>
                <li>뉴스레터 구독 서비스</li>
                <li>기타 블로그가 정하는 서비스</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">제5조 (서비스의 중단)</h2>
              <p>블로그는 다음 각 호에 해당하는 경우 서비스 제공을 중단할 수 있습니다:</p>
              <ol>
                <li>서비스용 설비의 보수 등 공사로 인한 부득이한 경우</li>
                <li>전기통신사업자가 전기통신 서비스를 중지했을 경우</li>
                <li>기타 불가항력적 사유가 있는 경우</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">제6조 (이용자의 의무)</h2>
              <p>이용자는 다음 행위를 하여서는 안됩니다:</p>
              <ol>
                <li>타인의 정보 도용</li>
                <li>블로그가 게시한 정보의 변경</li>
                <li>블로그가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                <li>블로그와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>블로그 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                <li>외설 또는 폭력적인 메시지, 기타 공서양속에 반하는 정보를 공개 또는 게시하는 행위</li>
                <li>기타 불법적이거나 부당한 행위</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">제7조 (저작권의 귀속)</h2>
              <ol>
                <li>블로그가 작성한 콘텐츠에 대한 저작권 기타 지적재산권은 블로그에 귀속합니다.</li>
                <li>이용자는 블로그를 이용함으로써 얻은 정보를 블로그의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">제8조 (면책조항)</h2>
              <ol>
                <li>블로그는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
                <li>블로그는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</li>
                <li>블로그는 이용자가 서비스와 관련하여 게재한 정보, 자료, 사실의 신뢰도, 정확성 등의 내용에 관하여는 책임을 지지 않습니다.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">제9조 (분쟁의 해결)</h2>
              <p>이 약관에 명시되지 않은 사항은 대한민국 법령에 따르며, 블로그와 이용자 간에 발생한 분쟁에 관한 소송은 민사소송법상의 관할법원에 제기합니다.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">부칙</h2>
              <p>이 약관은 2024년 1월 1일부터 시행됩니다.</p>
            </section>
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-6">Effective Date: January 1, 2024</p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using the {siteConfig.name} blog (the &quot;Service&quot;), you accept and agree to be bound by these Terms of Service.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p>{siteConfig.name} provides the following services:</p>
              <ul>
                <li>Blog content viewing</li>
                <li>Commenting functionality</li>
                <li>Newsletter subscription</li>
                <li>Other services as determined by {siteConfig.name}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. User Conduct</h2>
              <p>You agree not to:</p>
              <ul>
                <li>Impersonate any person or entity</li>
                <li>Upload, post, or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable</li>
                <li>Violate any local, state, national, or international law</li>
                <li>Infringe upon any proprietary rights of any party</li>
                <li>Upload, post, or transmit any material that contains viruses or any other harmful components</li>
                <li>Interfere with or disrupt the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property Rights</h2>
              <ol>
                <li>All content on {siteConfig.name}, including text, graphics, logos, images, and software, is the property of {siteConfig.name} and is protected by copyright laws.</li>
                <li>You may not reproduce, distribute, modify, create derivative works of, publicly display, republish, download, store, or transmit any of the material on our Service without prior written permission.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Privacy</h2>
              <p>Your use of our Service is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the Site and informs users of our data collection practices.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Disclaimers</h2>
              <p>The information on this blog is provided on an &quot;as is&quot; basis. To the fullest extent permitted by law, {siteConfig.name}:</p>
              <ul>
                <li>Makes no warranties, expressed or implied</li>
                <li>Does not guarantee the accuracy, completeness, or usefulness of any information</li>
                <li>Is not responsible for any errors or omissions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
              <p>In no event shall {siteConfig.name} be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Service.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Modifications to Terms</h2>
              <p>We reserve the right to modify these terms at any time. We will notify users of any changes by posting the new Terms of Service on this page.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
              <p>These Terms shall be governed and construed in accordance with the laws of the Republic of Korea, without regard to its conflict of law provisions.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
              <p>If you have any questions about these Terms of Service, please contact us at {siteConfig.emails.legal}.</p>
            </section>
          </>
        )}
      </div>
    </div>
  )
}