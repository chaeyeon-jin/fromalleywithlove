document.addEventListener('DOMContentLoaded', () => {
    const navButton = document.getElementById('navbutton');
    const dropdown = document.getElementById('dropdown');
    const silhouettesContainer = document.getElementById('silhouettes');
    const images = silhouettesContainer.querySelectorAll('img');
    const mainTitle = document.getElementById('mainTitle'); // Get main title element
    const placesSection = document.getElementById('places'); // Rename from about-places to places
    const aboutSection = document.getElementById('about'); // Get the new about section
    const letterForm = document.getElementById('letter-form'); // Get letter-form section
    const fixedBackground = document.getElementById('fixed-background'); // Get fixed background element
    const stampDetail = document.getElementById('stamp-detail'); // 스탬프 상세 정보 창
    const closeDetail = document.getElementById('close-detail'); // 닫기 버튼
    const detailContent = document.getElementById('detail-content'); // 상세 정보 내용
    const stamps = document.querySelectorAll('.stamp'); // 모든 스탬프 요소
    const originalImageContainer = document.getElementById('original-image-container'); // 원본 이미지 컨테이너
    const originalImage = document.getElementById('original-image'); // 원본 이미지 요소
    const placedAreas = [];
    const padding = 60; // Exclusion zone padding in pixels
    
    // 배경을 항상 radial-gradient로 유지
    if (fixedBackground) {
        fixedBackground.style.background = 'radial-gradient(#FF5EB4 30%, #cfcfcf 70%)';
    }
    
    // 커스텀 커서 요소
    const cursorFollower = document.getElementById('cursor-follower');
    
    // 타이틀 인터랙션 요소
    const mainTitleBox = document.getElementById('mainTitleBox');
    const titleChars = document.querySelectorAll('#mainTitle .char');
    
    // 마우스 움직임 추적 변수
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    
    // 마우스 움직임 감지
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // 메인 타이틀 영역에서의 마우스 위치 계산
        if (mainTitleBox) {
            const rect = mainTitleBox.getBoundingClientRect();
            const titleMouseX = e.clientX - rect.left;
            const titleMouseY = e.clientY - rect.top;
            
            // 타이틀 문자 인터랙션 업데이트
            updateTitleEffects(titleMouseX, titleMouseY);
        }
    });
    
    // 타이틀 효과 업데이트 함수
    function updateTitleEffects(mouseX, mouseY) {
        // 글자 위치 업데이트
        titleChars.forEach(char => {
            const charRect = char.getBoundingClientRect();
            const mainBoxRect = mainTitleBox.getBoundingClientRect();
            
            // mainTitleBox 기준 글자 중심 좌표 계산
            const charCenterX = charRect.left - mainBoxRect.left + charRect.width / 2;
            const charCenterY = charRect.top - mainBoxRect.top + charRect.height / 2;
            
            const dx = mouseX - charCenterX;
            const dy = mouseY - charCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const maxDistance = 250; // 인터랙션 반경 증가
            const maxOffset = 50;    // 최대 이동 픽셀 대폭 증가
            
            let offsetY = 0;
            let offsetX = 0;
            let rotation = 0;
            let scale = 1;
            
            if (distance < maxDistance) {
                const force = Math.pow((maxDistance - distance) / maxDistance, 2); // 제곱으로 비선형 효과 강화
                offsetY = (dy / distance) * force * maxOffset * -1; // 마우스에서 수직으로 멀어지는 방향
                offsetX = (dx / distance) * force * maxOffset * -0.8; // 수평 방향 이동 증가
                
                // 회전 효과 추가
                rotation = (dx / 100) * force * 10; // 좌우 위치에 따라 회전
                
                // 크기 효과 추가
                scale = 1 + force * 0.2; // 최대 20% 크기 증가
            }
            
            char.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg) scale(${scale})`;
        });
    }
    
    // 커서 팔로워 업데이트 애니메이션
    function updateCursorFollower() {
        // 부드러운 움직임을 위한 계산
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        
        // 커서 위치 업데이트
        if (cursorFollower) {
            cursorFollower.style.left = `${cursorX}px`;
            cursorFollower.style.top = `${cursorY}px`;
        }
        
        requestAnimationFrame(updateCursorFollower);
    }
    
    // 스탬프 아이들 애니메이션 파라미터 저장 객체
    const stampAnimations = new Map();
    
    // 스탬프 아이들 애니메이션 설정 함수
    function setupStampIdleAnimations() {
        stamps.forEach(stamp => {
            // 각 스탬프마다 랜덤한 애니메이션 속성 부여
            stampAnimations.set(stamp, {
                amplitude: 2 + Math.random() * 3, // 2-5px 움직임 범위
                speed: 1.5 + Math.random() * 2, // 1.5-3.5 속도 계수 (빠르게 변경)
                offset: Math.random() * Math.PI * 2, // 랜덤 시작 위치 (0-2π)
                baseY: 0 // 기본 Y 위치
            });
        });
        
        // 애니메이션 시작
        animateStamps();
    }
    
    // 스탬프 아이들 애니메이션 실행 함수
    function animateStamps() {
        const currentTime = performance.now() / 1000; // 시간을 초 단위로 변환
        
        stamps.forEach(stamp => {
            const params = stampAnimations.get(stamp);
            if (!params) return;
            
            // 사인파를 이용한 상하 움직임 계산
            const yOffset = params.amplitude * Math.sin(currentTime * params.speed + params.offset);
            
            // 현재 transform 스타일 가져오기 (마우스 인터랙션과 결합)
            const currentTransform = stamp.style.transform || '';
            
            // translate3d가 이미 적용된 경우 해당 값 추출, 없으면 기본값
            const existingTransform = currentTransform.match(/translate3d\(([^)]+)\)/);
            let x = 0, y = params.baseY, z = 0;
            
            if (existingTransform && existingTransform[1]) {
                const parts = existingTransform[1].split(',').map(part => parseFloat(part));
                if (parts.length === 3) {
                    x = parts[0]; // X 위치 유지
                    y = params.baseY; // Y는 기본값으로 (인터랙션에 의한 이동은 무시하고 애니메이션만 적용)
                    z = parts[2]; // Z 위치 유지
                }
            }
            
            // 회전과 크기 값 추출 (있는 경우)
            const rotateMatch = currentTransform.match(/rotate\(([^)]+)\)/);
            const rotate = rotateMatch ? rotateMatch[1] : '0deg';
            
            const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/);
            const scale = scaleMatch ? scaleMatch[1] : '1';
            
            // 아이들 애니메이션만 적용하거나 인터랙션과 결합
            if (currentTransform.includes('translate')) {
                // 인터랙션 중일 때는 애니메이션 Y 오프셋만 추가
                stamp.style.transform = `translate3d(${x}px, ${y + yOffset}px, ${z}px) rotate(${rotate}) scale(${scale})`;
            } else {
                // 인터랙션 없을 때는 애니메이션만 적용
                stamp.style.transform = `translate3d(0, ${yOffset}px, 0) rotate(0deg) scale(1)`;
            }
        });
        
        // 다음 프레임 요청
        requestAnimationFrame(animateStamps);
    }
    
    // 실루엣 이미지 인터랙션 처리 함수
    function handleSilhouetteInteraction(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // 마우스 위치에 따라 인터랙티브 요소 이동
        images.forEach(element => {
            const rect = element.getBoundingClientRect();
            const elementCenterX = rect.left + rect.width / 2;
            const elementCenterY = rect.top + rect.height / 2;
            
            // 마우스와 요소 간의 거리 계산
            const distanceX = mouseX - elementCenterX;
            const distanceY = mouseY - elementCenterY;
            
            // 거리 기반 이동 강도 계산
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            const maxDistance = 350; // 최대 영향 거리 증가
            
            if (distance < maxDistance) {
                // 마우스에서 멀어지는 방향으로 이동
                // 극적인 이동을 위해 강도 증가
                const moveX = distanceX * -0.25 * (1 - distance / maxDistance);
                const moveY = distanceY * -0.25 * (1 - distance / maxDistance);
                
                // 요소가 이미지인 경우 더 강한 이동 효과 적용
                const strengthMultiplier = 3; // 강도 증가
                
                // 추가 회전 효과
                const rotation = (distanceY * distanceX) / (distance * 50);
                
                element.style.transform = `translate(${moveX * strengthMultiplier}px, ${moveY * strengthMultiplier}px) rotate(${rotation}deg)`;
            } else {
                // 최대 거리를 벗어나면 원래 위치로 부드럽게 복귀
                element.style.transform = 'translate(0, 0) rotate(0deg)';
            }
        });
    }
    
    // 스탬프 인터랙션 처리 함수
    function handleStampInteraction(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // 스탬프 요소들을 모두 가져오기
        const stampElements = document.querySelectorAll('#stampwrapper .stamp');
        
        // 각 스탬프에 인터랙션 적용
        stampElements.forEach(stamp => {
            const stampImg = stamp.querySelector('img');
            if (!stampImg) return;
            
            const rect = stamp.getBoundingClientRect();
            const stampCenterX = rect.left + rect.width / 2;
            const stampCenterY = rect.top + rect.height / 2;
            
            // 마우스와 스탬프 간의 거리 계산
            const dx = mouseX - stampCenterX;
            const dy = mouseY - stampCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 인터랙션 파라미터
            const maxDistance = 250; // 인터랙션 반경
            const maxOffset = 30;    // 최대 이동 픽셀
            const maxRotation = 8;   // 최대 회전 각도
            const maxScale = 1.15;   // 최대 크기 변화
            
            if (distance < maxDistance) {
                // 거리에 따른 효과 강도 계산 (비선형 감쇠)
                const force = Math.pow((maxDistance - distance) / maxDistance, 2);
                
                // 마우스에서 멀어지는 방향으로 이동
                const moveX = (dx / distance) * force * maxOffset * -1;
                const moveY = (dy / distance) * force * maxOffset * -1;
                
                // 회전 효과
                const rotation = ((dx + dy) / distance) * force * maxRotation;
                
                // 크기 효과
                const scale = 1 + force * (maxScale - 1);
                
                // 애니메이션 파라미터 가져오기
                const params = stampAnimations.get(stamp);
                const yOffset = params ? params.amplitude * Math.sin(performance.now() / 1000 * params.speed + params.offset) : 0;
                
                // 스탬프 요소에 변형 적용 (애니메이션 Y값 추가)
                stamp.style.transform = `translate3d(${moveX}px, ${moveY + yOffset}px, 0) rotate(${rotation}deg) scale(${scale})`;
                
                // 인터랙션 중일 때 애니메이션 기준점 업데이트
                if (params) {
                    params.baseY = moveY;
                }
            } else {
                // 애니메이션 파라미터 가져오기
                const params = stampAnimations.get(stamp);
                const yOffset = params ? params.amplitude * Math.sin(performance.now() / 1000 * params.speed + params.offset) : 0;
                
                // 범위 밖에서는 애니메이션만 적용
                stamp.style.transform = `translate3d(0, ${yOffset}px, 0) rotate(0deg) scale(1)`;
                
                // 인터랙션 없을 때 애니메이션 기준점 초기화
                if (params) {
                    params.baseY = 0;
                }
            }
        });
    }
    
    // 마우스 움직임 이벤트에 인터랙션 추가
    document.addEventListener('mousemove', handleSilhouetteInteraction);
    document.addEventListener('mousemove', handleStampInteraction);
    
    // 인터랙티브 요소 호버 이벤트
    function setupCursorHoverEffects() {
        // 클릭 가능한 모든 요소 선택
        const interactiveElements = document.querySelectorAll('a, button, .stamp, #dropdown li, #navbutton, #close-detail, input, select, textarea');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                if (cursorFollower) {
                    cursorFollower.classList.add('cursor-hover');
                }
            });
            
            element.addEventListener('mouseleave', () => {
                if (cursorFollower) {
                    cursorFollower.classList.remove('cursor-hover');
                }
            });
        });
        
        console.log('커서 호버 효과 설정 완료:', interactiveElements.length, '개의 요소에 적용됨');
    }
    
    // 초기화 함수
    function initializeEffects() {
        // 커서 애니메이션 시작
        updateCursorFollower();
        
        // 커서 호버 효과 설정
        setupCursorHoverEffects();
        
        // 스탬프 아이들 애니메이션 설정
        setupStampIdleAnimations();
        
        // 스탬프 드래그 앤 드롭 기능은 여기서 제거
        // setupStampDragAndDrop();
    }
    
    // 초기화 실행
    initializeEffects();
    
    // 원본 이미지 경로 매핑 (스탬프 코드 -> 원본 이미지 경로)
    const originalImageMap = {
        // 기존 경로가 동작하지 않는 경우를 위한 대체 이미지
        'fallback': 'https://placekitten.com/800/600',
        
        'cmr1': './original/충무로1.png',
        'cmr2': './original/충무로2.png',
        'cmr3': './original/충무로3.png',
        'cmr4': './original/충무로4.png',
        'ejr1': './original/을지로1.png',
        'ejr2': './original/을지로2.png',
        'ejr3': './original/을지로3.png',
        'ejr4': './original/을지로4.png',
        'dm1': './original/동묘1.png',
        'dm2': './original/동묘2.png',
        'dm3': './original/동묘3.png',
        'dm4': './original/동묘4.png',
        'jr1': './original/종로1.png',
        'jr2': './original/종로2.png',
        'jr3': './original/종로3.png',
        'jr4': './original/종로4.png',
        'dd1': './original/동대문1.png',
        'dd2': './original/동대문2.png',
        'dd3': './original/동대문3.png',
        'dd4': './original/동대문4.png',
    };
    
    // 스탬프 상세 정보 데이터 (실제로는 더 많은 정보가 있을 수 있음)
    const stampData = {
        'stamp1': { title: '<br> <br>발견 장소: 충무로', description: '비오는 날 길바닥에 놓여있던 수많은 종이심들.<br>충무로 인쇄골목만의 독특한 흔적입니다.', code: 'cmr1' },
        'stamp2': { title: '<br> <br> <br> 발견 장소: 충무로', description: '밝은 미소의 어느 간판.<br> 바빠도 웃으면서 살아요, 다들 스마일~', code: 'cmr2' },
        'stamp3': { title: '<br> <br> <br> 발견 장소: 충무로', description: '인쇄소 앞에서 반겨주던 세 신사들.<br> 여러분 모두 어서오십시요!!', code: 'cmr3' },
        'stamp4': { title: '<br>발견 장소: 충무로', description: '교통 고깔의 엄청난 변신.<br> 플라스틱 테이블과 얽혀 조형물로 탄생했습니다.', code: 'cmr4' },
        'stamp5': { title: '<br> <br> <br> 발견 장소: 을지로', description: '을지로 노포의 테이블. <br> 서로 대비되는 색을 가졌지만 사이좋은 짝꿍같은 둘.', code: 'ejr1' },
        'stamp6': { title: '<br> <br> <br> 발견 장소: 을지로', description: '어느 철물점 앞의 표지판. <br> 스프레이 프린트는 항상 색다른 질감을 만들어냅니다.', code: 'ejr2' },
        'stamp7': { title: '<br> <br> <br> 발견 장소: 을지로', description: '거친 질감의 파란 알맹이들. <br> 묘하게 빛바랜 색감은 회색빛 하늘과 어우러집니다.', code: 'ejr3' },
        'stamp8': { title: '<br> <br> <br> 발견 장소: 을지로', description: '호프집 테이블과 의자. <br> 서로 포개어진 모습은 새로운 실루엣을 제시합니다.', code: 'ejr4' },
        'stamp9': { title: '<br> <br><br> <br> 발견 장소: 동묘', description: '벼룩시장에서 발견한 연꽃 사진.<br> 새 것빼고 전부 다 있는 동묘시장.', code: 'dm1' },
        'stamp10': { title:'<br> <br> <br> 발견 장소: 동묘', description: '주인없는 카메라들. <br> 이제는 낡아버린 그들의 추억.', code: 'dm2' },
        'stamp11': { title: '<br> 발견 장소: 동묘', description: '모든 걸 다 지워주는 옥쏠라. <br> 비누를 섞어 문질러주세요.', code: 'dm3' },
        'stamp12': { title: '<br> <br> <br> <br> 발견 장소: 동묘', description: '브이. 이게 바로 히트상품. <br> 런닝이 단돈 오천원.', code: 'dm4' },
        'stamp13': { title: '<br> <br> 발견 장소: 종로 5가', description: '보기만 해도 발이 아픈 지압슬리퍼.<br> 이걸 신으면 건강해지나요?', code: 'jr1' },
        'stamp14': { title: '발견 장소: 종로 5가', description: '의료기 도매합니다. <br> 노란 테이프로 서로 엮여있는 간판과 벽돌들.', code: 'jr2' },
        'stamp15': { title: '<br> <br> 발견 장소: 종로 5가', description: '문닫은 가게 앞의 화초. <br> 아름다운 붉은빛을 뽐내며 묵묵히 자리를 지킵니다.', code: 'jr3' },
        'stamp16': { title: '<br> <br> <br><br> 발견 장소: 종로 5가', description: '로또집도 주일은 쉽니다. <br> 안내문 뒤로 빼곡히 자리잡은 로또용지의 글씨들.', code: 'jr4' },
        'stamp17': { title: '발견 장소: 동대문', description: '도장집의 거대한 도장 모양 간판.<br> 강렬한 빨간색이 눈길을 끕니다.', code: 'dd1' },
        'stamp18': { title: '<br> <br> <br> 발견 장소: 동대문', description: '원단시장 안에서 발견한 원단 조각들. <br> 겹겹이 쌓여가며 하나의 형태를 이루고 있습니다.', code: 'dd2' },
        'stamp19': { title: '<br> <br><br> 발견 장소: 동대문', description: '사주, 신점, 타로 모두 다 봐드립니다. <br> 동대문 길거리에서 발견한 간판의 모습입니다.', code: 'dd3' },
        'stamp20': { title: '<br> <br> <br> <br> 발견 장소: 동대문', description: '몸에 빨간 리본을 감고있는 돌고래. <br> 아, 진짜 돌고래는 아니고 돌고래 풍선.', code: 'dd4' },
    };
    
    let isMouseOver = false;
    let mouseLeaveTimeout;
    let currentDetailImage = null; // 현재 활성화된 스탬프 이미지 요소 저장
    
    // 원본 이미지 표시 함수
    function showOriginalImage(imgPath, event, detailImageElement) {
        // 이미지 경로를 추출하고 상대 경로로 조정
        let imageSrc = '';
        
        // 이미지 경로가 http로 시작하거나 이미 처리된 절대 경로라면 그대로 사용
        if (imgPath && (imgPath.startsWith('http') || imgPath.startsWith('/'))) {
            imageSrc = imgPath;
        } else if (imgPath) {
            // 상대 경로인 경우 그대로 사용
            imageSrc = imgPath;
        } else {
            // 이미지 경로가 없는 경우 fallback 사용
            imageSrc = originalImageMap.fallback;
        }
        
        console.log('이미지 로드 시도:', imageSrc);
        
        if (detailImageElement) {
            // 현재 활성화된 스탬프 이미지 저장
            currentDetailImage = detailImageElement;
            
            // 스탬프 이미지의 위치와 크기 가져오기
            const stampRect = detailImageElement.getBoundingClientRect();
            
            // 컨테이너 위치 및 크기 조정 - 스탬프와 정확히 동일하게
            originalImageContainer.style.position = 'fixed';
            originalImageContainer.style.top = `${stampRect.top}px`;
            originalImageContainer.style.left = `${stampRect.left}px`;
            originalImageContainer.style.width = `${stampRect.width}px`;
            originalImageContainer.style.height = `${stampRect.height}px`;
            originalImageContainer.style.transform = 'none';
            
            // 배경 투명하게, 테두리 제거
            originalImageContainer.style.backgroundColor = 'transparent';
            originalImageContainer.style.border = 'none';
            originalImageContainer.style.boxShadow = 'none';
            
            // 이미지 크기 조정 - 스탬프와 동일하게
            originalImage.style.width = '100%';
            originalImage.style.height = '100%';
            originalImage.style.objectFit = 'contain';
            
            // 스탬프 이미지 숨기기
            detailImageElement.style.opacity = '0';
            detailImageElement.style.transition = 'opacity 0.3s';
        }
        
        // 이미지 로딩 시작 전에 이벤트 핸들러 설정
        originalImage.onload = function() {
            console.log('이미지 로드 성공:', imageSrc);
            originalImageContainer.style.display = 'flex';
            setTimeout(() => {
                originalImageContainer.classList.add('visible');
            }, 10);
        };
        
        originalImage.onerror = function() {
            console.error('이미지 로드 실패, fallback 사용:', imageSrc);
            originalImage.src = originalImageMap.fallback;
        };
        
        // 이미지 로딩 시작
        originalImage.src = imageSrc;
    }
    
    // 원본 이미지 숨기기 함수
    function hideOriginalImage(immediate = false) {
        // 타임아웃 중복 방지
        if (mouseLeaveTimeout) {
            clearTimeout(mouseLeaveTimeout);
            mouseLeaveTimeout = null;
        }
        
        // 현재 숨겨진 스탬프 이미지 다시 표시
        if (currentDetailImage) {
            currentDetailImage.style.opacity = '1';
            currentDetailImage = null;
        }
        
        if (immediate) {
            // 즉시 숨김 (애니메이션 없이)
            originalImageContainer.classList.remove('visible');
            originalImageContainer.style.display = 'none';
        } else {
            // 페이드 아웃 후 실제 숨김 처리
            originalImageContainer.classList.remove('visible');
            setTimeout(() => {
                if (!originalImageContainer.classList.contains('visible')) {
                    originalImageContainer.style.display = 'none';
                }
            }, 300); // transition 시간과 맞춤
        }
    }
    
    // 현재 활성화된 이미지 코드 저장 변수
    let activeImageCode = null;

    // 원본 이미지 컨테이너에 마우스 이벤트 추가
    originalImageContainer.addEventListener('mouseenter', () => {
        isMouseOver = true;
        // 숨김 타임아웃 취소
        if (mouseLeaveTimeout) {
            clearTimeout(mouseLeaveTimeout);
            mouseLeaveTimeout = null;
        }
    });
    
    originalImageContainer.addEventListener('mouseleave', () => {
        isMouseOver = false;
        // 지연 시간을 두고 숨김 처리
        mouseLeaveTimeout = setTimeout(() => {
            if (!isMouseOver) {
                hideOriginalImage();
            }
        }, 300); // 더 긴 지연 시간 사용
    });
    
    // 클릭 시 원본 이미지 창 닫기
    originalImageContainer.addEventListener('click', hideOriginalImage);
    
    // 스탬프 클릭 이벤트 설정
    stamps.forEach(stamp => {
        stamp.addEventListener('click', () => {
            // 스탬프 ID에 해당하는 데이터 가져오기
            const stampId = stamp.id;
            const data = stampData[stampId];
            
            if (data) {
                // 상세 정보 창 내용 채우기
                detailContent.innerHTML = `
                    <h3>${data.title}</h3>
                    <p>${data.description}</p>
                    <div class="detail-image-container">
                        <img src="${stamp.querySelector('img').src}" alt="${data.title}" 
                             style="max-width: 80%; margin: 20px auto; display: block;" 
                             class="detail-image" data-code="${data.code}">
                    </div>
                    <p class="hover-instruction">마우스를 올려 원래 모습을 감상해보세요.</p>
                `;
                
                // 항상 오른쪽에서 나오도록 설정
                    stampDetail.classList.add('open');
                
                // body에 detail-open 클래스 추가하여 #stamps 레이아웃 변경
                // requestAnimationFrame을 사용해 다음 프레임에서 클래스 추가
                requestAnimationFrame(() => {
                    document.body.classList.add('detail-open');
                });
                
                // 상세 정보 창 내 이미지에 마우스오버 이벤트 추가
                const detailImage = detailContent.querySelector('.detail-image');
                const imageContainer = detailContent.querySelector('.detail-image-container');
                
                if (detailImage && imageContainer) {
                    const stampCode = detailImage.getAttribute('data-code');
                    const originalImgPath = originalImageMap[stampCode];
                    
                    // 이미지 경로 검증 및 로그
                    console.log('스탬프 코드:', stampCode);
                    console.log('원본 이미지 경로:', originalImgPath);
                    
                    // 이미지 존재 여부 확인을 위한 임시 테스트
                    if (originalImgPath && !originalImgPath.startsWith('http')) {
                        fetch(originalImgPath)
                            .then(response => {
                                console.log('이미지 접근 가능 여부:', response.ok, originalImgPath);
                            })
                            .catch(error => {
                                console.error('이미지 접근 중 오류:', error, originalImgPath);
                            });
                    }
                    
                    // 컨테이너에 마우스오버 이벤트 추가
                    imageContainer.addEventListener('mouseenter', (event) => {
                        isMouseOver = true;
                        
                        // 숨김 타임아웃 취소
                        if (mouseLeaveTimeout) {
                            clearTimeout(mouseLeaveTimeout);
                            mouseLeaveTimeout = null;
                        }
                        
                        if (originalImgPath) {
                            showOriginalImage(originalImgPath, event, detailImage);
                        }
                    });
                    
                    // 마우스가 컨테이너를 벗어날 때만 이미지 숨김
                    imageContainer.addEventListener('mouseleave', () => {
                        isMouseOver = false;
                        
                        // 더 긴 지연을 두어 깜빡임 방지
                        mouseLeaveTimeout = setTimeout(() => {
                            if (!isMouseOver) {
                                hideOriginalImage();
                            }
                        }, 300);
                    });
                }
            }
        });
    });
    
    // 닫기 버튼 클릭 이벤트
    closeDetail.addEventListener('click', () => {
        // 먼저 body에서 클래스 제거하여 stamps 섹션 크기 변경 시작
        document.body.classList.remove('detail-open');
        
        // 약간의 지연 후 detail 창 닫기 (transition이 더 부드럽게 진행되도록)
        setTimeout(() => {
        stampDetail.classList.remove('open');
        }, 50);
        
        hideOriginalImage(true); // 원본 이미지도 즉시 숨김
    });
    
    // 배경 클릭 시 상세 정보 창 닫기
    stampDetail.addEventListener('click', (e) => {
        if (e.target === stampDetail) {
            // 먼저 body에서 클래스 제거하여 stamps 섹션 크기 변경 시작
            document.body.classList.remove('detail-open');
            
            // 약간의 지연 후 detail 창 닫기 (transition이 더 부드럽게 진행되도록)
            setTimeout(() => {
            stampDetail.classList.remove('open');
            }, 50);
            
            hideOriginalImage(true); // 원본 이미지도 즉시 숨김
        }
    });

    // --- Navigation Toggle --- 
    navButton.addEventListener('click', (event) => {
        event.stopPropagation();
        if (dropdown.classList.contains('collapsed')) {
            dropdown.classList.remove('collapsed');
            dropdown.setAttribute('user-toggled', 'true');
            setTimeout(() => {
                dropdown.removeAttribute('user-toggled');
            }, 5000);
        } else {
            dropdown.classList.add('collapsed');
        }
    });

    // 네비게이션 메뉴 항목에 클릭 이벤트 추가
    const navItems = dropdown.querySelectorAll('li');
    
    // About 항목 (인덱스 0)
    navItems[0].addEventListener('click', () => {
        // About 섹션으로 스크롤
        const aboutSection = document.getElementById('about');
        window.scrollTo({
            top: aboutSection.offsetTop,
            behavior: 'smooth'
        });
        dropdown.classList.add('collapsed');
    });
    
    // Places 항목 (인덱스 1)
    navItems[1].addEventListener('click', () => {
        // Places 섹션으로 스크롤
        const targetScrollPosition = window.innerHeight * 2.2; // Places 섹션이 잘 보이는 스크롤 위치
        window.scrollTo({
            top: targetScrollPosition,
            behavior: 'smooth'
        });
        dropdown.classList.add('collapsed');
    });
    
    // Stamps 항목 (인덱스 2)
    navItems[2].addEventListener('click', () => {
        // Stamps 섹션으로 스크롤
        const stampsSection = document.getElementById('stamps');
        const stampsPosition = stampsSection.offsetTop - 50; // 여백 50px 추가
        window.scrollTo({
            top: stampsPosition,
            behavior: 'smooth'
        });
        dropdown.classList.add('collapsed');
    });
    
    // Post office 항목 (인덱스 3) - 아직 구현되지 않은 기능
    if (navItems[3]) {
        navItems[3].addEventListener('click', () => {
            const stampsSection = document.getElementById('stamps');
            // 스탬프 섹션이 완전히 화면에서 벗어나도록 스크롤
            const targetScrollPosition = stampsSection.offsetTop + stampsSection.offsetHeight;
            window.scrollTo({
                top: targetScrollPosition,
                behavior: 'smooth'
            });
            
            dropdown.classList.add('collapsed');
        });
    }

    /* Remove the document click listener to prevent closing on outside click
    document.addEventListener('click', (event) => {
        if (!dropdown.contains(event.target) && event.target !== navButton) {
            dropdown.style.display = 'none';
        }
    });
    */

    // --- Scroll Animation for Places Section (Horizontal Scroll) ---
    function updatePlacesPosition() {
        const stickyContainer = document.getElementById('places-sticky-container');
        const placesWrapper = document.getElementById('placeswrapper');
        const placesTitle = document.getElementById('places-title-container');
        
        if (!stickyContainer || !placesWrapper) return;
        
        const viewportHeight = window.innerHeight;
        const containerRect = stickyContainer.getBoundingClientRect();
        
        // Calculate how much the top of the container has scrolled past the top of the viewport
        const scrollYRelativeToContainerStart = -containerRect.top;
        
        // Define the total vertical scroll distance over which the horizontal animation occurs
        // This should match the extra height given to the sticky container (e.g., 400vh total - 100vh for places = 300vh)
        const animationScrollDistance = 300 * viewportHeight / 100; // 300vh in pixels
        
        // Calculate the progress of the horizontal scroll (0 to 1)
        // Clamp progress between 0 and 1
        const progress = Math.max(0, Math.min(1, scrollYRelativeToContainerStart / animationScrollDistance));
        
        // Define the start and end translateX values (in vw)
        const startTranslateX = 0; // Start with content visible but ready to scroll left
        const endTranslateX = -100; // 변경: -80vw → -100vw (wrapper 너비 변경에 맞춤)
        
        // Calculate the current translateX value
        const targetX = startTranslateX + progress * (endTranslateX - startTranslateX);
        
        // Apply the transform to the inner wrapper
        placesWrapper.style.transform = `translateX(${targetX}vw)`;
        
        // 스티키 타이틀이 생성된 경우에만 처리
        if (placesTitle) {
            // places 섹션이 뷰포트에 있을 때만 타이틀을 보이게 함
            if (containerRect.top <= 0 && containerRect.bottom >= viewportHeight * 0.3) {
                placesTitle.style.opacity = "1";
            } else {
                placesTitle.style.opacity = "0";
            }
        }
        
        // Add parallax effect to the place-image elements
        const placeImages = document.querySelectorAll('.place-image img');
        placeImages.forEach((img, index) => {
            // Calculate a parallax offset based on progress and item position
            const itemProgress = progress * 5 - index;
            const parallaxOffset = itemProgress * 10; // Adjust multiplier for parallax intensity
            
            // Apply parallax effect only to visible items
            if (itemProgress > -1 && itemProgress < 2) {
                img.style.transform = `translateX(${parallaxOffset}px)`;
            }
        });
        
        // Add scaling effect to place-number elements
        const placeNumbers = document.querySelectorAll('.place-number');
        placeNumbers.forEach((number, index) => {
            const itemProgress = progress * 5 - index;
            
            // Apply scale effect based on how centered the item is
            if (itemProgress > -1 && itemProgress < 2) {
                const scale = 1 - Math.abs(itemProgress - 0.5) * 0.5;
                number.style.opacity = scale;
                number.style.transform = `scale(${scale})`;
            }
        });
        
        // Debugging
        console.log('Places Scroll:', {
            containerTop: containerRect.top,
            relativeScroll: scrollYRelativeToContainerStart,
            progress: progress,
            targetX: targetX
        });
    }
    
    // Remove the setupScrollIndicators function since indicators are removed
    // function setupScrollIndicators() { ... }

    // --- Scroll Animation for Letter-Form Section (Horizontal Scroll) ---
    function updateLetterFormPosition() {
        const stickyContainer = document.getElementById('letter-form-sticky-container');
        const letterForm = document.getElementById('letter-form');
        const stampsSection = document.getElementById('stamps');
        
        if (!stickyContainer || !letterForm || !stampsSection) return;
        
        const viewportHeight = window.innerHeight;
        const containerRect = stickyContainer.getBoundingClientRect();
        const stampsRect = stampsSection.getBoundingClientRect();
        
        // stamps 섹션이 화면 상단에서 얼마나 벗어났는지 계산 (음수면 아직 stamps가 화면에 보임)
        const stampsExitProgress = (viewportHeight - stampsRect.bottom) / viewportHeight;
        
        // stampsExitProgress가 0에서 1 사이일 때 (stamps가 화면에서 나가기 시작할 때부터 완전히 나갈 때까지)
        // 애니메이션을 진행합니다
        const progress = Math.max(0, Math.min(1, stampsExitProgress));
        
        // Define the start and end translateX values (in vw)
        const startTranslateX = 100; // Start off-screen to the right
        const endTranslateX = 0; // End position (centered)
        
        // Calculate the current translateX value
        const targetX = startTranslateX + progress * (endTranslateX - startTranslateX);
        
        // Apply the transform to letter-form
        letterForm.style.transform = `translateX(${targetX}vw)`;
        
        // Debugging
        console.log('Letter Form Scroll:', {
            stampsBottom: stampsRect.bottom,
            viewportHeight: viewportHeight,
            stampsExitProgress: stampsExitProgress,
            progress: progress,
            targetX: targetX
        });
    }

    // --- Scroll Animation for Footer Display ---
    function updateFooterVisibility() {
        const footer = document.getElementById('footer');
        const letterFormContainer = document.getElementById('letter-form-sticky-container');
        
        if (!footer || !letterFormContainer) return; // letterForm check removed as it's not directly needed here
        
        const viewportHeight = window.innerHeight;
        const containerRect = letterFormContainer.getBoundingClientRect();
        const containerBottom = containerRect.bottom; // Distance from viewport top to container bottom
        
        // Calculate the threshold for showing the footer
        // Show when the bottom of the letter-form container is near the bottom of the viewport 
        // (e.g., when less than 90% of the viewport height remains below the container bottom)
        const showThreshold = viewportHeight * 0.9; 
        
        console.log('Footer Visibility Debug:', {
            containerBottom: containerBottom,
            viewportHeight: viewportHeight,
            showThreshold: showThreshold,
            shouldShow: containerBottom < showThreshold
        });
        
        // If the bottom of the container is close enough to the viewport bottom, show the footer
        if (containerBottom < showThreshold) {
            footer.classList.add('visible');
        } else {
            footer.classList.remove('visible');
        }
    }

    // Listen for scroll events for all scrollable sections
    window.addEventListener('scroll', () => {
        updatePlacesPosition();
        updateLetterFormPosition();
        updateFooterVisibility(); // 새로운 함수 호출 추가
    });
    
    // Initial call to position all sections correctly
    updatePlacesPosition();
    updateLetterFormPosition();
    updateFooterVisibility(); // 초기 호출 추가

    // --- Silhouette Positioning --- 
    function checkOverlap(newRect, placedAreas, mainTitleZone, navButtonZone) {
        const buffer = 2; // Small buffer in pixels between images

        // Check against placed images WITH buffer
        for (const existingRect of placedAreas) {
            const overlap = !(newRect.right < existingRect.left - buffer || 
                            newRect.left > existingRect.right + buffer || 
                            newRect.bottom < existingRect.top - buffer || 
                            newRect.top > existingRect.bottom + buffer);
            if (overlap) return true;
        }
        // Check against main title exclusion zone (no buffer needed here)
        const titleOverlap = !(newRect.right < mainTitleZone.left || 
                             newRect.left > mainTitleZone.right || 
                             newRect.bottom < mainTitleZone.top || 
                             newRect.top > mainTitleZone.bottom);
        if (titleOverlap) return true;

        // Check against nav button exclusion zone (no buffer needed here)
        const navOverlap = !(newRect.right < navButtonZone.left || 
                           newRect.left > navButtonZone.right || 
                           newRect.bottom < navButtonZone.top || 
                           newRect.top > navButtonZone.bottom);
        if (navOverlap) return true;

        return false; // No overlap
    }

    function positionSilhouettes() {
        placedAreas.length = 0; // Clear previously placed areas
        const containerRect = silhouettesContainer.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        // Calculate exclusion zones relative to the container
        const mainTitleRect = mainTitle.getBoundingClientRect();
        const navButtonRect = navButton.getBoundingClientRect();

        const mainTitleExclusionZone = {
            top: mainTitleRect.top - padding - containerRect.top,
            left: mainTitleRect.left - padding - containerRect.left,
            right: mainTitleRect.right + padding - containerRect.left,
            bottom: mainTitleRect.bottom + padding - containerRect.top
        };
        const navButtonExclusionZone = {
            top: navButtonRect.top - padding - containerRect.top,
            left: navButtonRect.left - padding - containerRect.left,
            right: navButtonRect.right + padding - containerRect.left,
            bottom: navButtonRect.bottom + padding - containerRect.top
        };

        // Calculate available placement area within the container, considering viewport padding
        const viewportMinX = padding - containerRect.left;
        const viewportMinY = padding - containerRect.top;
        const viewportMaxX = window.innerWidth - padding - containerRect.left;
        const viewportMaxY = window.innerHeight - padding - containerRect.top;

        const availableLeft = Math.max(0, viewportMinX);
        const availableTop = Math.max(0, viewportMinY);
        const availableRight = Math.min(containerWidth, viewportMaxX);
        const availableBottom = Math.min(containerHeight, viewportMaxY);

        const availableWidth = Math.max(0, availableRight - availableLeft);
        const availableHeight = Math.max(0, availableBottom - availableTop);
        
        if (availableWidth <= 0 || availableHeight <= 0) {
            console.warn("Available placement area is zero or negative. Check container size and padding.");
            return; // Cannot place images
        }

        images.forEach(img => {
            // Use a reasonable estimate if natural dimensions aren't available yet
            const estimatedHeight = containerHeight * 0.06; // From previous CSS max-height: 6vh
            const imgHeight = Math.min(img.naturalHeight || estimatedHeight, estimatedHeight);
            const aspectRatio = (img.naturalWidth && img.naturalHeight) ? img.naturalWidth / img.naturalHeight : 1; 
            const imgWidth = imgHeight * aspectRatio;

            // Ensure image fits in available area
            if (imgWidth > availableWidth || imgHeight > availableHeight) {
                console.warn("Image is too large for the available placement area:", img.src);
                img.style.display = 'none';
                return; // Skip this image
            }

            let randomTop, randomLeft, newRect;
            let attempts = 0;
            const maxAttempts = 150; // Increase max attempts slightly

            do {
                // Generate random coordinates within the *available* container bounds
                randomTop = availableTop + Math.random() * (availableHeight - imgHeight);
                randomLeft = availableLeft + Math.random() * (availableWidth - imgWidth);

                // Define the bounding box relative to the container
                newRect = {
                    top: randomTop,
                    left: randomLeft,
                    right: randomLeft + imgWidth,
                    bottom: randomTop + imgHeight
                };
                attempts++;
            } while (checkOverlap(newRect, placedAreas, mainTitleExclusionZone, navButtonExclusionZone) && attempts < maxAttempts);

            if (attempts < maxAttempts) {
                // Apply position using percentages relative to the container
                img.style.top = `${(randomTop / containerHeight) * 100}%`;
                img.style.left = `${(randomLeft / containerWidth) * 100}%`;
                img.style.display = 'block'; // Ensure visible if previously hidden
                placedAreas.push(newRect);
            } else {
                console.warn("Could not place image without overlap after", maxAttempts, "attempts:", img.src);
                img.style.display = 'none'; 
            }
        });
    }

    // Use a slightly longer timeout or consider window load
    setTimeout(positionSilhouettes, 200); 

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(positionSilhouettes, 300); 
    });

    // --- 스탬프 드래그 앤 드롭 기능 ---
    function setupStampDragAndDrop() {
        const stampOptions = document.querySelectorAll('.stamp-option');
        const letterMain = document.querySelector('.letter-main');
        const letterBody = document.querySelector('.letter-body');
        
        // 기존 이벤트 리스너 제거 (중복 방지)
        letterBody.removeEventListener('dragover', handleLetterBodyDragOver);
        letterBody.removeEventListener('dragleave', handleLetterBodyDragLeave);
        letterBody.removeEventListener('drop', handleLetterBodyDrop);
        
        // 각 스탬프 옵션에 드래그 기능 추가
        stampOptions.forEach(stampOption => {
            // 기존 리스너 제거
            stampOption.removeAttribute('draggable');
            const newStampOption = stampOption.cloneNode(true);
            stampOption.parentNode.replaceChild(newStampOption, stampOption);
            
            // 새 리스너 추가
            newStampOption.setAttribute('draggable', 'true');
            
            newStampOption.addEventListener('dragstart', (e) => {
                // 드래그 시작 시 데이터 저장
                const img = newStampOption.querySelector('img');
                const imgSrc = img.src;
                e.dataTransfer.setData('text/plain', imgSrc);
                
                // 드래그 이미지 설정 (선택 사항)
                const dragIcon = document.createElement('img');
                dragIcon.src = imgSrc;
                dragIcon.style.width = '50px';
                dragIcon.style.height = 'auto';
                dragIcon.style.opacity = '0.7';
                document.body.appendChild(dragIcon);
                e.dataTransfer.setDragImage(dragIcon, 25, 25);
                
                // 드래그 완료 후 제거 예약
                setTimeout(() => {
                    document.body.removeChild(dragIcon);
                }, 0);
            });
        });
        
        // 함수로 분리하여 이벤트 리스너 참조 유지
        function handleLetterBodyDragOver(e) {
            // 기본 동작 방지 (필수 - 이렇게 해야 드롭 가능)
            e.preventDefault();
            // 드롭 가능 표시
            letterBody.classList.add('drag-over');
        }
        
        function handleLetterBodyDragLeave() {
            // 드래그가 영역을 벗어날 때 표시 제거
            letterBody.classList.remove('drag-over');
        }
        
        function handleLetterBodyDrop(e) {
            // 기본 동작 방지
            e.preventDefault();
            
            // 드래그 오버 스타일 제거
            letterBody.classList.remove('drag-over');
            
            // 드롭된 이미지 URL 가져오기
            const imgSrc = e.dataTransfer.getData('text/plain');
            if (!imgSrc) return;
            
            // letter-content-wrapper 요소 찾기
            const contentWrapper = document.querySelector('.letter-content-wrapper');
            if (!contentWrapper) return;

            // stamps-layer 요소 찾기 - 스탬프가 실제로 배치될 요소
            const stampsLayer = document.querySelector('.stamps-layer');
            if (!stampsLayer) return;
            
            // 스탬프 레이어의 위치와 크기 가져오기
            const stampLayerRect = stampsLayer.getBoundingClientRect();
            
            // 드롭 위치 계산 - 스탬프 레이어 기준으로 상대적 위치 계산
            const x = e.clientX - stampLayerRect.left;
            const y = e.clientY - stampLayerRect.top;
            
            // 새 스탬프 요소 생성
            const stampElem = document.createElement('div');
            stampElem.className = 'placed-stamp';
            stampElem.style.position = 'absolute';
            stampElem.style.left = `${x}px`;
            stampElem.style.top = `${y}px`;
            
            // 스탬프 이미지가 중앙에 오도록 transform 속성 설정
            stampElem.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 20 - 10}deg)`;
            
            stampElem.style.zIndex = '10';
            stampElem.style.cursor = 'move';
            
            // 스탬프 이미지 추가 - 크기 1.7배 증가
            const stampImg = document.createElement('img');
            stampImg.src = imgSrc;
            stampImg.style.width = '204px'; // 기존 120px의 1.7배
            stampImg.style.height = 'auto';
            stampImg.style.pointerEvents = 'none'; // 이미지 자체는 이벤트 무시
            
            // 스탬프 요소에 이미지 추가
            stampElem.appendChild(stampImg);
            
            // stamps-layer에 스탬프 추가 (letterBody 대신)
            stampsLayer.appendChild(stampElem);
            
            // 배치된 스탬프에 이동 기능 추가
            makeStampMovable(stampElem);
        }
        
        // 이벤트 리스너 추가
        letterBody.addEventListener('dragover', handleLetterBodyDragOver);
        letterBody.addEventListener('dragleave', handleLetterBodyDragLeave);
        letterBody.addEventListener('drop', handleLetterBodyDrop);
    }

    // 배치된 스탬프를 이동 가능하게 하는 함수
    function makeStampMovable(stampElem) {
        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;
        
        // 스탬프 드래그 시작
        stampElem.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            // 현재 위치 가져오기 (translate 변환 고려)
            const transformStyle = window.getComputedStyle(stampElem).transform;
            const matrix = new DOMMatrixReadOnly(transformStyle);
            const rotation = Math.random() * 20 - 10; // 새로운 회전 각도
            
            // 현재 위치 저장
            initialLeft = parseInt(stampElem.style.left) || 0;
            initialTop = parseInt(stampElem.style.top) || 0;
            
            // 현재 요소를 최상위로 올리기
            stampElem.style.zIndex = '20';
            
            // 다른 스탬프들은 낮은 z-index로
            const otherStamps = document.querySelectorAll('.placed-stamp:not(:hover)');
            otherStamps.forEach(stamp => {
                stamp.style.zIndex = '10';
            });
            
            // 커서 변경
            stampElem.style.cursor = 'grabbing';
            
            // 이벤트 전파 방지
            e.preventDefault();
        });
        
        // 문서 전체에 이벤트 리스너 추가 (드래그 중에도 움직임 감지)
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            // 이동 거리 계산
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            // 위치 업데이트
            stampElem.style.left = `${initialLeft + dx}px`;
            stampElem.style.top = `${initialTop + dy}px`;
        });
        
        // 드래그 종료
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                stampElem.style.cursor = 'move';
            }
        });
        
        // 더블 클릭으로 삭제
        stampElem.addEventListener('dblclick', () => {
            stampElem.parentNode.removeChild(stampElem);
        });
    }

    // Rich Text Editor Functionality - 이 부분만 유지하고 아래 중복 코드는 제거
    let optionsButtons = document.querySelectorAll(".option-button");
    let advancedOptionButtons = document.querySelectorAll(".adv-option-button");
    let fontSizeRef = document.getElementById("fontSize");
    let letterBody = document.querySelector(".letter-body");
    let linkButton = document.getElementById("createLink");
    let alignButtons = document.querySelectorAll(".align");
    let spacingButtons = document.querySelectorAll(".spacing");
    let formatButtons = document.querySelectorAll(".format");
    let scriptButtons = document.querySelectorAll(".script");

    const initializeEditor = () => {
        // 서식 버튼 하이라이트 초기화
        highlighter(alignButtons, true);
        highlighter(spacingButtons, true);
        highlighter(formatButtons, false);
        highlighter(scriptButtons, true);

        // 폰트 크기 옵션 초기화
        if (fontSizeRef && fontSizeRef.options.length <= 1) {
            for (let i = 1; i <= 7; i++) {
                let option = document.createElement("option");
                option.value = i;
                option.innerHTML = i * 4; // 각 옵션 간 크기 차이를 4로 설정
                fontSizeRef.appendChild(option);
            }
            fontSizeRef.value = 4; // 초기값을 4로 설정
        }
    };

    const modifyText = (command, defaultUi, value) => {
        // 편집 영역에 포커스 주기
        if (letterBody) {
            letterBody.focus();
        }
        document.execCommand(command, defaultUi, value);
    };

    // 편집 버튼 이벤트 리스너 설정
    optionsButtons.forEach((button) => {
        button.addEventListener("click", () => {
            modifyText(button.id, false, null);
        });
    });
    
    // 고급 옵션 (폰트, 크기 등) 이벤트 리스너 설정
    advancedOptionButtons.forEach((button) => {
        button.addEventListener("change", () => {
            modifyText(button.id, false, button.value);
        });
    });

    // 링크 추가 기능
    if (linkButton) {
        linkButton.addEventListener("click", () => {
            let userLink = prompt("Enter a URL?");
            if (userLink) {
                if (!/http/i.test(userLink)) {
                    userLink = "http://" + userLink;
                }
                modifyText(linkButton.id, false, userLink);
            }
        });
    }

    const highlighter = (className, needsRemoval) => {
        className.forEach((button) => {
            button.addEventListener("click", () => {
                if (needsRemoval) {
                    let alreadyActive = false;
                    if (button.classList.contains("active")) {
                        alreadyActive = true;
                    }
                    highlighterRemover(className);
                    if (!alreadyActive) {
                        button.classList.add("active");
                    }
                } else {
                    button.classList.toggle("active");
                }
            });
        });
    };

    const highlighterRemover = (className) => {
        className.forEach((button) => {
            button.classList.remove("active");
        });
    };

    // 페이지 로드 시 에디터 초기화
    document.addEventListener("DOMContentLoaded", initializeEditor);
    
    // 초기화 함수도 즉시 호출
    initializeEditor();
    
    // 스탬프 드래그 & 드롭 기능 초기화
    setupStampDragAndDrop();
    
    // 편지 전송 기능 구현
    const sendButton = document.querySelector('.send-button');
    const toInput = document.getElementById('to-input');
    const letterContainer = document.querySelector('.letter-container');
    
    // 로딩 인디케이터 생성
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = `
        <div class="spinner"></div>
        <p>편지를 전송하는 중입니다...</p>
    `;
    loadingIndicator.style.display = 'none';
    document.querySelector('#letter-form').appendChild(loadingIndicator);
    
    // 성공/실패 메시지 컨테이너
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container';
    messageContainer.style.display = 'none';
    document.querySelector('#letter-form').appendChild(messageContainer);
    
    // 이메일 유효성 검사 함수
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    // EmailJS 초기화
    function initEmailJS() {
        try {
            // EmailJS 사용자 ID
            const emailJsUserId = "guitLgWsLBlFvbK0B";
            console.log('EmailJS 초기화 - 사용자 ID:', emailJsUserId);
            emailjs.init(emailJsUserId);
            
            // EmailJS 버전 확인
            console.log('EmailJS 버전:', emailjs.SDK_VERSION || '알 수 없음');
            
            // EmailJS가 올바르게 초기화되었는지 확인
            if (typeof emailjs.send !== 'function') {
                console.error('EmailJS send 함수가 존재하지 않습니다. 라이브러리가 제대로 로드되지 않았을 수 있습니다.');
                throw new Error('EmailJS send 함수를 찾을 수 없습니다.');
            }
            
            return true;
        } catch (error) {
            console.error('EmailJS 초기화 오류:', error);
            throw new Error('EmailJS 초기화 오류: ' + error.message);
        }
    }
    
    // 편지 전송 함수
    async function sendEmail(e) {
        e.preventDefault();
        
        const toEmail = toInput.value.trim();
        
        // 이메일 유효성 검사
        if (!toEmail || !validateEmail(toEmail)) {
            alert('유효한 이메일 주소를 입력해주세요.');
            toInput.focus();
            return;
        }
        
        try {
            // 로딩 인디케이터 표시
            loadingIndicator.style.display = 'flex';
            letterContainer.style.opacity = '0.5';
            sendButton.disabled = true;
            
            // 디버깅 메시지
            console.log('편지 캡처 시작...');
            
            // letter-content-wrapper 요소를 이미지로 캡처 (텍스트와 우표 모두 포함)
            const contentWrapper = document.querySelector('.letter-content-wrapper');
            if (!contentWrapper) {
                throw new Error('편지 내용을 찾을 수 없습니다.');
            }
            const letterBody = contentWrapper.querySelector('.letter-body'); // Get the letter body
            
            // 캡처 전에 요소의 현재 스타일 저장
            const originalPadding = contentWrapper.style.padding;
            const originalMargin = contentWrapper.style.margin;
            const originalBorder = contentWrapper.style.border;
            const letterBodyOriginalMarginTop = letterBody ? letterBody.style.marginTop : ''; // letter-body의 원래 margin-top 저장
            
            // 캡처를 위해 임시로 패딩과 마진, 보더 조정
            contentWrapper.style.padding = '0';
            contentWrapper.style.margin = '0';
            contentWrapper.style.border = 'none'; // 보더 임시 제거
            if (letterBody) {
                letterBody.style.marginTop = '0'; // letter-body의 margin-top 임시 제거
            }
            
            try {
                // Get the height of the letter-body to use as capture height
                const captureHeight = letterBody.offsetHeight;
                console.log(`Using letter-body height for capture: ${captureHeight}px`);

                const canvas = await html2canvas(contentWrapper, {
                    allowTaint: true,
                    useCORS: true,
                    logging: true,
                    scale: 0.8,
                    backgroundColor: 'white',
                    x: 0,
                    y: 0,
                    width: contentWrapper.offsetWidth, // Use contentWrapper's width
                    height: captureHeight, // Use letterBody's height
                    scrollX: 0,
                    scrollY: 0,
                    windowWidth: document.documentElement.offsetWidth,
                    windowHeight: document.documentElement.offsetHeight,
                    removeContainer: true,
                    foreignObjectRendering: false,
                    // 상단 여백 제거를 위한 트리밍 옵션 (유지)
                    trimCanvas: true 
                });
                
                console.log('편지 캡처 완료. 이미지 데이터 생성 중...');
                
                // 캔버스를 이미지 데이터 URL로 변환 (JPEG 포맷 사용)
                const imageData = canvas.toDataURL('image/jpeg', 0.7);
                
                // 이미지 데이터 크기 확인
                console.log('이미지 데이터 크기:', Math.round(imageData.length / 1024), 'KB');
                
                // 이미지 데이터가 너무 크면 더 축소
                let optimizedImageData = imageData;
                if (imageData.length > 500000) { // 500KB 초과하면
                    console.log('이미지 크기가 너무 큽니다. 추가 압축 시도...');
                    // 임시 캔버스에 그려서 크기 축소
                    const tempCanvas = document.createElement('canvas');
                    const ctx = tempCanvas.getContext('2d');
                    const img = new Image();
                    img.src = imageData;
                    
                    // 이미지 로드 후 리사이징
                    await new Promise(resolve => {
                        img.onload = () => {
                            // 원본 캔버스 크기의 60%로 축소
                            tempCanvas.width = canvas.width * 0.6;
                            tempCanvas.height = canvas.height * 0.6;
                            ctx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
                            optimizedImageData = tempCanvas.toDataURL('image/jpeg', 0.5); // JPEG 포맷 사용
                            console.log('추가 압축 후 이미지 크기:', Math.round(optimizedImageData.length / 1024), 'KB');
                            resolve();
                        };
                    });
                }
                
                // EmailJS 초기화
                console.log('EmailJS 초기화 중...');
                initEmailJS();
                
                // EmailJS 파라미터 설정
                const params = {
                    to_email: toEmail,
                    message: "골목으로부터, With Love에서 편지가 도착했습니다.",
                    image_base64: optimizedImageData  // 최적화된 이미지 사용
                };
                
                // 이미지 데이터 확인
                console.log('이미지 데이터 시작 부분:', optimizedImageData.substring(0, 100));
                console.log('이미지 전송 파라미터:', Object.keys(params));
                
                // EmailJS로 이메일 전송
                console.log('이메일 전송 시작...');
                try {
                    // 템플릿 설정 확인 및 중요 정보
                    const serviceId = "service_v9qnfb4";
                    const templateId = "template_o96j3b1";
                    
                    console.log(`이메일 전송 설정 - 서비스 ID: ${serviceId}, 템플릿 ID: ${templateId}`);
                    console.log('이메일 템플릿에서 다음 변수명이 정확히 일치하는지 확인하세요:');
                    console.log('- to_email: 받는 사람 이메일 주소');
                    console.log('- message: 편지 메시지');
                    console.log('- image_base64: 이미지 데이터');
                    
                    // 이미지 데이터 준비 확인
                    const imageDataCheck = optimizedImageData.startsWith('data:image/');
                    console.log('이미지 데이터 형식 확인:', imageDataCheck ? 'OK' : 'ERROR');
                    
                    const result = await emailjs.send(
                        "fromalleywithlove", // 서비스 ID
                        "fromalleywithlove", // 템플릿 ID
                        params
                    );
                    
                    console.log('이메일 전송 성공:', result);
                    
                    // 성공 메시지 표시
                    messageContainer.innerHTML = `
                        <div class="success-message">
                            <h3>편지가 성공적으로 전송되었습니다!</h3>
                            <p>${toEmail}로 편지가 발송되었습니다.</p>
                            <p><small>이미지 전송 상태: ${result.text === 'OK' ? '성공' : '불확실'}</small></p>
                            <div style="text-align: center; width: 100%;">
                                <button id="send-another" class="option-button" style="display: block; margin: 0 auto;">다른 편지 보내기</button>
                            </div>
                        </div>
                    `;
                    messageContainer.style.display = 'block';
                    letterContainer.style.display = 'none';
                    sendButton.style.display = 'none';
                    
                    // 다른 편지 보내기 버튼 이벤트 리스너
                    document.getElementById('send-another').addEventListener('click', () => {
                        // 폼 초기화
                        toInput.value = '';
                        letterBody.innerHTML = '수정가능합니다';
                        
                        // 스탬프 제거
                        const stampsLayer = document.querySelector('.stamps-layer');
                        if (stampsLayer) {
                            stampsLayer.innerHTML = ''; // 모든 스탬프 제거
                        }
                        
                        // UI 복원
                        messageContainer.style.display = 'none';
                        letterContainer.style.display = 'flex';
                        letterContainer.style.opacity = '1';
                        sendButton.style.display = 'block';
                        sendButton.disabled = false;
                    });
                } catch (emailError) {
                    // EmailJS 관련 오류 세부 정보 출력
                    console.error('EmailJS 오류 세부 정보:', emailError);
                    throw new Error(`EmailJS 오류: ${emailError.message || '알 수 없는 오류'}`);
                }
                
            } finally {
                // 캡처 후 원래 스타일 복원
                contentWrapper.style.padding = originalPadding;
                contentWrapper.style.margin = originalMargin;
                contentWrapper.style.border = originalBorder; // 보더 복원
                if (letterBody) {
                    letterBody.style.marginTop = letterBodyOriginalMarginTop; // letter-body의 margin-top 복원
                }
            }
            
        } catch (error) {
            // 오류 메시지 표시
            console.error('이메일 전송 오류 상세:', error);
            
            // 상세 오류 메시지 생성
            let errorMessage = '죄송합니다. 다시 시도해주세요.';
            if (error.message) {
                errorMessage += `<br><small>오류 메시지: ${error.message}</small>`;
            }
            
            messageContainer.innerHTML = `
                <div class="error-message">
                    <h3>편지 전송 중 오류가 발생했습니다</h3>
                    <p>${errorMessage}</p>
                    <div style="text-align: center; width: 100%;">
                        <button id="try-again" class="option-button" style="display: block; margin: 10px auto;">다시 시도하기</button>
                    </div>
                </div>
            `;
            messageContainer.style.display = 'block';
            letterContainer.style.display = 'none';
            sendButton.style.display = 'none';
            
            // 다시 시도하기 버튼 이벤트 리스너
            document.getElementById('try-again').addEventListener('click', () => {
                // UI 복원
                messageContainer.style.display = 'none';
                letterContainer.style.display = 'flex';
                letterContainer.style.opacity = '1';
                sendButton.style.display = 'block';
                sendButton.disabled = false;
            });
        } finally {
            // 로딩 인디케이터 숨기기
            loadingIndicator.style.display = 'none';
        }
    }
    
    // 전송 버튼 이벤트 리스너 등록
    if (sendButton) {
        sendButton.addEventListener('click', sendEmail);
    }
});