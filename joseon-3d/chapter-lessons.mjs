import {mountNavalBattle} from './naval-battle.mjs';
import {chapters78,art78,media78,steps78} from './chapter-data-78.mjs';
import {chapters456,art456,media456,extendedSteps,extendedCorrect,route456,routeState456,tradeState456,research456} from './chapter-data-456.mjs';
// Local prototype. Original effective data: production v11-data (20261012-21).
// Textbook grounding: society_5-2-2 (1).pdf printed pp.79–85,87–90; PDF pages 7,9–12,14–17.
// Illustrations are fictional reconstructions. No textbook pages or private material are bundled.
export const chapters = {
  "2": {
    "title": "백성의 어려움을 해결하라",
    "era": "세종 시대",
    "intro": "기록은 사람에게 도움이 되어야 해. 농부의 경험과 새 도구, 새 글자로 어려움을 해결해 보자.",
    "companion": "쇠돌",
    "review": [
      {
        "q": "어느 고을에서 다른 지역의 농사책대로 씨를 뿌렸더니 잘 자라지 않았어요. 『농사직설』을 만든 방법에 가장 가까운 것은?",
        "options": [
          "각 도 농부들의 경험을 모아 우리 땅에 맞게 정리한다",
          "다른 지역 책의 방법을 더 꼼꼼히 외워 그대로 따른다",
          "농사를 지어 본 적 없는 관리의 생각만 모아 적는다",
          "땅과 날씨가 다른 고을끼리는 농사법을 묻지 않는다"
        ],
        "a": 0,
        "why": "『농사직설』은 각 도 농부들의 경험을 모아 우리나라 환경에 맞는 농사법을 정리한 책이에요.",
        "art": "farm4:3"
      },
      {
        "q": "한 해 동안 고을마다 내린 비의 양을 같은 기준으로 비교하려 해요. 알맞은 기구와 그 쓰임은?",
        "options": [
          "자격루 — 흐르는 물의 양으로 내린 비의 양을 알아요",
          "혼천의 — 하늘을 살펴 비가 온 양을 셈해요",
          "측우기 — 그릇에 고인 빗물의 깊이를 재어 비교해요",
          "앙부일구 — 해 그림자의 길이로 비의 양을 재요"
        ],
        "a": 2,
        "why": "측우기는 그릇에 고인 빗물의 깊이를 재어 비의 양을 알아요. 자격루는 물의 흐름으로 시각을, 혼천의는 천체의 움직임을, 앙부일구는 해 그림자로 시각을 알아보는 데 썼어요.",
        "art": "farm4:1",
        "optionArt": [
          "instruments:3",
          "instruments:0",
          "instruments:1",
          "instruments:2"
        ]
      },
      {
        "q": "세종이 훈민정음을 만든 뜻에 가장 가까운 것은?",
        "options": [
          "한자를 아는 일부 신하만 나랏일의 글을 쓰도록 돕는 것",
          "백성이 쉽게 읽고 써 자신의 뜻을 전하도록 돕는 것",
          "새 글자를 만들면 주변 나라와 교류하지 않아도 되게 하는 것",
          "우리말 대신 중국말을 쉽게 익히도록 돕는 것"
        ],
        "a": 1,
        "why": "한자는 배우기 어렵고 우리말과 달라 불편했어요. 세종은 백성이 쉽게 읽고 쓸 수 있는 훈민정음을 만들었어요. 유교의 가르침을 알리고 문화가 발전하는 데도 도움이 되었어요.",
        "art": "chapter2:2",
        "clip": "hangul"
      }
    ],
    "missions": [
      {
        "id": 4,
        "ch": 1,
        "title": "농부의 경험을 책으로",
        "type": "evidence",
        "goal": "『농사직설』에 도움이 될 자료 3개를 골라요.",
        "record": "세종은 우리나라 환경에 맞는 농사 경험을 모아 『농사직설』을 만들게 했다.",
        "check": {
          "q": "비가 적은 지역의 농사법을 비가 많은 우리 마을에 적용하려 해요. 가장 알맞은 방법은?",
          "options": [
            "우리 마을의 땅·날씨와 농부의 경험을 비교해 알맞게 고친다",
            "같은 작물이므로 강수량이 달라도 물 주는 양까지 그대로 따른다",
            "책의 방법을 따르기 위해 우리 마을 농부의 경험은 살피지 않는다",
            "수확량이 많았다는 기록만 보고 전체 논에 적용한다"
          ],
          "a": 0,
          "why": "같은 작물도 땅과 날씨에 따라 기르는 방법이 달라져요. 우리 환경에 맞는 경험을 모은 책이 『농사직설』이에요."
        },
        "need": 3,
        "cards": [
          {
            "title": "농부에게 직접 듣기",
            "text": "이곳 땅과 날씨에서 농사지은 경험을 말해 주었어요.",
            "tag": "yes"
          },
          {
            "title": "우리 논밭을 살피기",
            "text": "같은 방법이라도 우리 지역에서 잘 자라는지 살폈어요.",
            "tag": "yes"
          },
          {
            "title": "다른 나라 방법을 그대로",
            "text": "다른 지역의 농사책을 우리 땅과 날씨를 살피지 않고 그대로 따르자고 해요.",
            "tag": "no"
          },
          {
            "title": "농사 경험을 적기",
            "text": "농부가 들려준 씨 뿌리기와 수확 경험을 책으로 정리해요.",
            "tag": "yes"
          }
        ],
        "hint": "지역의 환경과 농부들의 경험이 담긴 자료를 골라요.",
        "art": "farm4:3",
        "learnTitle": "농부의 경험에서 찾은 지혜",
        "cardArt": [
          "farm4:0",
          "farm4:1",
          "farm4:2",
          "farm4:3"
        ],
        "checkArt": "farm4:1",
        "recordActivities": [
          {
            "type": "compare",
            "panels": [
              {
                "art": "farm4:2",
                "label": "농사 방법이 적힌 자료",
                "note": ""
              },
              {
                "art": "farm4:3",
                "label": "우리 마을 농부의 경험",
                "note": ""
              }
            ],
            "prompt": "다른 지역의 농사법을 우리 마을에 적용하려면?",
            "options": [
              "수확량이 많았던 방법이면 모두 그대로 따라요.",
              "같은 작물은 땅과 날씨가 달라도 똑같이 길러요.",
              "우리 땅과 날씨, 농부의 경험을 살펴 맞게 고쳐요."
            ],
            "answer": 2,
            "summary": "세종은 우리나라 환경에 맞는 농사 경험을 모아 농사직설을 만들게 했어요."
          }
        ]
      },
      {
        "id": 5,
        "ch": 1,
        "title": "왕실 관측소의 하루",
        "type": "tools",
        "goal": "상황에 맞는 도구 2개를 골라 의뢰 3개를 해결해요.",
        "record": "혼천의·측우기·앙부일구·자격루는 천체·비·시간을 알아보는 데 쓰였다.",
        "check": {
          "q": "햇빛이 없는 때에도 자격루로 시각을 알 수 있는 까닭은?",
          "options": [
            "별의 움직임을 보고 시각을 정하기 때문이에요.",
            "내린 비의 양을 재어 시각으로 바꾸기 때문이에요.",
            "물의 흐름을 이용하는 물시계이기 때문이에요.",
            "해 그림자를 더 크게 비추기 때문이에요."
          ],
          "a": 2,
          "why": "앙부일구는 해 그림자를 이용하고, 자격루는 물의 흐름을 이용해 자동으로 시각을 알려 주었어요.",
          "artPair": [
            "instruments:2",
            "instruments:3"
          ]
        },
        "hint": "측우기는 비, 혼천의는 천체와 연결해요. 시각은 해가 있으면 앙부일구, 해가 없으면 자격루로 알아요.",
        "art": "instruments:2",
        "learnTitle": "날씨에 맞게 도구를 골라요",
        "checkArtPair": [
          "instruments:2",
          "instruments:3"
        ],
        "checkArtLabels": [
          "앙부일구 · 해 그림자",
          "자격루 · 물의 흐름"
        ],
        "checkClip": "waterclock",
        "recordActivities": [
          {
            "type": "link",
            "pairs": [
              {
                "art": "instruments:2",
                "label": "앙부일구",
                "text": "해 그림자로 시각을 알아요."
              },
              {
                "art": "instruments:3",
                "label": "자격루",
                "text": "물의 흐름으로 시각을 알아요."
              }
            ],
            "summary": "앙부일구는 해 그림자를, 자격루는 물의 흐름을 이용해 시각을 알려 주었어요.",
            "prompt": "각 그림에 맞는 설명을 선택란에서 골라 연결해요."
          }
        ]
      },
      {
        "id": 6,
        "ch": 1,
        "title": "세종의 새 글자, 백성의 목소리",
        "type": "hangul",
        "goal": "백성의 부탁을 듣고, 쉬운 글자로 뜻을 전하는 여정을 완성해요.",
        "record": "세종은 백성이 쉽게 익혀 자신의 뜻을 글로 전하도록 훈민정음을 창제했다.",
        "check": {
          "q": "훈민정음에 반대한 일부 신하가 걱정한 점은 무엇일까요?",
          "options": [
            "중국과의 관계와 한자로 배우던 중국 문화에 대한 걱정",
            "농부의 경험을 농사책에 담기 어려워진다는 걱정",
            "북쪽 국경을 지킬 군사를 모으기 어렵다는 걱정",
            "지역마다 빗물을 재는 눈금이 달라진다는 걱정"
          ],
          "a": 0,
          "why": "당시 반대한 일부 신하는 중국과의 관계가 나빠질까 걱정했고, 중국 문화를 배우려면 한자를 알아야 한다고 생각했어요. 세종은 백성이 쉽게 읽고 써 자기 뜻을 전하게 하려고 훈민정음을 만들었어요."
        },
        "hint": "물은 ㅁ·ㅜ·ㄹ, 밥은 ㅂ·ㅏ·ㅂ으로 이루어져요.",
        "art": "chapter2:2",
        "learnTitle": "백성을 위한 새 글자",
        "checkArt": "chapter2:4",
        "recordActivities": [
          {
            "type": "link",
            "pairs": [
              {
                "art": "chapter2:2",
                "label": "세종의 뜻",
                "text": "백성이 쉽게 읽고 써 자기 뜻을 전하게 하자."
              },
              {
                "art": "chapter2:4",
                "label": "당시 반대한 일부 신하의 생각",
                "text": "중국과의 관계가 나빠질까 걱정되고, 중국 문화를 배우려면 한자를 알아야 한다고 생각했어요."
              }
            ],
            "summary": "세종은 백성이 쉽게 읽고 쓰기를 바랐고, 당시 반대한 일부 신하는 중국과의 관계와 한자 공부를 걱정했어요.",
            "prompt": "각 인물에 맞는 생각을 선택란에서 골라 연결해요."
          }
        ]
      },
      {
        "id": 7,
        "ch": 1,
        "title": "국경의 지도, 바다의 소식",
        "type": "match",
        "goal": "주변 나라와 있었던 일을 연결해요.",
        "record": "조선은 주변 나라와 교류하고, 필요할 때는 군사적으로 대응했다.",
        "check": {
          "q": "사신은 문물을 받아 오고, 군사는 국경을 지켰어요. 조선과 주변 나라의 관계를 바르게 설명한 것은?",
          "options": [
            "사신은 전쟁을 준비하려고 오갔고, 문물을 나누지는 않았어요.",
            "모든 나라에 같은 교류 조건을 내세우고, 국경에서도 똑같이 대응했어요.",
            "문물을 주고받기도 하고, 필요할 때 군사적으로 대응했어요.",
            "문물을 받아 오는 나라와는 다툼이 없어 국경을 지킬 필요도 없었어요."
          ],
          "a": 2,
          "why": "명과는 대체로 우호적으로 교류했어요. 일본·여진과도 교류하면서 필요한 때에는 왜구를 막거나 북쪽 국경을 개척했어요."
        },
        "pairs": [
          [
            "대체로 좋은 관계를 유지하며 문물을 교류",
            "명"
          ],
          [
            "왜구의 근거지인 쓰시마섬 공격",
            "일본 관련 대응"
          ],
          [
            "압록강·두만강 일대에 4군 6진 개척",
            "여진 관련 대응"
          ]
        ],
        "hint": "압록강·두만강은 북쪽, 쓰시마섬은 바다 건너에 있어요.",
        "art": "chapter2:5",
        "learnTitle": "교류와 군사적 대응",
        "pairArt": [
          "diplomacy:0",
          "diplomacy:1",
          "diplomacy:2"
        ],
        "context": [
          {
            "art": "diplomacy:0",
            "name": "명과 문물 교류",
            "text": "필요한 문물을 받아들이며 대체로 좋은 관계를 유지했어요."
          },
          {
            "art": "diplomacy:1",
            "name": "바다의 안전",
            "text": "일본과 교류하면서도, 바다를 약탈하던 왜구의 근거지인 쓰시마섬을 공격했어요."
          },
          {
            "art": "diplomacy:2",
            "name": "북쪽 국경",
            "text": "여진과도 교류했지만 필요할 때 군사적으로 대응했어요. 세종 때 4군 6진을 개척했어요."
          }
        ],
        "recordActivities": [
          {
            "type": "compare",
            "panels": [
              {
                "art": "diplomacy:0",
                "label": "문물을 주고받는 사신",
                "note": ""
              },
              {
                "art": "diplomacy:2",
                "label": "북쪽 국경의 대응",
                "note": ""
              }
            ],
            "prompt": "두 모습을 함께 설명하는 기록을 골라요.",
            "options": [
              "주변 나라와 교류하며 필요할 때 군사적으로 대응했어요.",
              "교류하는 나라와는 다툼이 없어 국경을 지키지 않았어요.",
              "모든 나라에 같은 교류 조건과 군사 대응을 적용했어요."
            ],
            "answer": 0,
            "summary": "조선은 주변 나라와 문물을 교류하고, 필요할 때는 군사적으로 대응했어요."
          }
        ]
      }
    ]
  },
  "3": {
    "title": "서로 다른 사람들의 하루",
    "era": "유교 질서와 생활의 변화",
    "intro": "같은 마을에 살아도 하루는 달랐대. 네 사람의 이야기와 두 세대의 가족 기록을 모두 살펴보자.",
    "companion": "다온",
    "review": [
      {
        "q": "『삼강행실도』에서 글과 함께 그림을 보여 준 까닭은?",
        "options": [
          "글을 모르는 사람도 유교의 가르침을 이해하도록",
          "농부가 그림으로 우리 땅에 맞는 농사법을 익히도록",
          "관리가 그림으로 새 법 조항을 찾아 적용하도록",
          "상인이 여러 장시의 물건값을 그림으로 비교하도록"
        ],
        "a": 0,
        "why": "『삼강행실도』는 글을 읽기 어려운 백성도 그림을 통해 유교의 가르침을 이해하도록 했어요.",
        "art": "samgang"
      },
      {
        "q": "외국 말을 통역하거나 의술 같은 전문 기술을 맡았던 사람은 주로 어느 신분이었나요?",
        "options": [
          "상민",
          "중인",
          "양반",
          "천민"
        ],
        "a": 1,
        "why": "중인은 통역이나 의술 같은 전문 기술을 맡았어요. 신분마다 맡는 일과 기회에 차이가 있었어요.",
        "art": "npc-roles:3"
      },
      {
        "q": "전기에는 아들과 딸이 제사를 돌아가며 지냈지만, 후기에는 아들 중심의 제사가 널리 퍼졌어요. 알맞은 설명은?",
        "options": [
          "후기로 갈수록 딸의 역할만 커졌어요.",
          "재산 상속과 제사 관행은 조선 내내 같았어요.",
          "한 가족의 기록만으로 모든 집이 같다고 말할 수 있어요.",
          "유교 질서가 강화되며 가족의 생활도 달라졌어요."
        ],
        "a": 3,
        "why": "후기로 갈수록 유교 질서가 강화되면서 아들 중심의 상속과 제사 관행이 널리 퍼졌어요. 모든 집이 동시에 똑같이 바뀐 것은 아니에요.",
        "art": "npc-roles:3",
        "artPair": [
          "family5:0",
          "family5:1"
        ]
      }
    ],
    "missions": [
      {
        "id": 8,
        "ch": 2,
        "title": "글과 그림으로 전하는 가르침",
        "type": "match",
        "goal": "세 교육 기관과 한 권의 책을 알맞은 설명에 연결해요.",
        "record": "조선은 유교의 가르침을 널리 알리려고 한양에 성균관을, 지방에 향교를 두었다. 서당에서는 글과 예절을 배우고, 삼강행실도에서는 글과 그림으로 가르침을 전했다.",
        "check": {
          "q": "그림을 곁들인 『삼강행실도』로 알 수 있는 것은?",
          "options": [
            "유교의 가르침을 널리 알리려 했다",
            "우리나라 환경에 맞는 농사법을 모으려 했다",
            "서양의 새로운 지도를 소개하려 했다",
            "땅과 집의 거래 절차를 정하려 했다"
          ],
          "a": 0,
          "why": "글을 읽기 어려운 사람도 그림으로 내용을 이해하도록 했어요."
        },
        "pairs": [
          [
            "나라가 한양에 세운 조선의 최고 교육 기관",
            "성균관"
          ],
          [
            "유교의 가르침을 널리 알리려고 나라가 지방에 세운 학교",
            "향교"
          ],
          [
            "마을 아이들이 훈장에게 글의 기초와 예절을 배운 글방",
            "서당"
          ],
          [
            "본받을 만한 사람의 이야기를 글과 그림으로 전한 책",
            "삼강행실도"
          ]
        ],
        "hint": "한양의 최고 학교는 성균관, 나라가 지방에 세운 학교는 향교예요. 서당은 마을의 글방, 삼강행실도는 글과 그림으로 된 책이에요.",
        "art": "samgang",
        "learnTitle": "글과 그림으로 배운 유교",
        "checkArt": "samgang",
        "pairArt": [
          "education:0",
          "education:1",
          "education:2",
          "samgang"
        ],
        "recordActivities": [
          {
            "type": "blank",
            "art": "samgang",
            "before": "삼강행실도는 글과 그림으로 ",
            "after": "을 널리 전하려고 만들었어요.",
            "options": [
              "새로운 농사법",
              "유교의 가르침",
              "서양의 지리 지식"
            ],
            "answer": 1,
            "summary": "삼강행실도는 글을 읽기 어려운 사람도 그림으로 유교의 가르침을 이해하도록 했어요.",
            "prompt": "알맞은 말 조각을 골라 기록을 완성해요."
          }
        ]
      },
      {
        "id": 9,
        "ch": 2,
        "title": "기록을 찾아 판결하라",
        "type": "trial",
        "goal": "오늘은 고을 수령! 당시 법을 근거로 세 사건을 판단해요.",
        "record": "『경국대전』에는 나라 운영과 백성의 생활에 관한 법이 담겼으며 관혼상제를 중요하게 여겼다.",
        "check": {
          "q": "관혼상제의 뜻을 바르게 설명한 것은?",
          "options": [
            "성인이 됨·혼인·장례·조상의 제사와 관련된 의례",
            "임금·관리·백성이 나랏일을 나누어 맡는 제도",
            "성균관·향교·서당·서원에서 글을 익히는 단계",
            "씨 뿌리기·김매기·추수·씨앗 보관의 농사 과정"
          ],
          "a": 0,
          "why": "유교 질서가 법과 일생의 의례에도 영향을 주었어요. 당시 법과 오늘의 법은 달라요."
        },
        "hint": "법 조항에서 나이·기한·부모의 상황을 확인해요.",
        "art": "chapter3:0",
        "learnTitle": "법에 근거해 판단해요",
        "recordActivities": [
          {
            "type": "blank",
            "art": "chapter3:0",
            "before": "관혼상제는 성인이 되는 의례·혼인·",
            "after": "·조상의 제사와 관련된 의례예요.",
            "options": [
              "농사",
              "과거 시험",
              "장례"
            ],
            "answer": 2,
            "summary": "관혼상제는 성인이 되는 의례, 혼인, 장례, 조상의 제사를 뜻해요.",
            "prompt": "알맞은 말 조각을 골라 기록을 완성해요."
          }
        ]
      },
      {
        "id": 10,
        "ch": 2,
        "title": "네 사람의 하루",
        "type": "statuses",
        "goal": "네 사람의 이야기와 모습을 보고 양반·중인·상민·천민을 구분해요.",
        "record": "조선 시대에는 신분에 따라 맡는 일과 의무, 누리는 기회가 달랐다.",
        "check": {
          "q": "네 사람의 기록을 비교한 결론으로 알맞은 것은?",
          "options": [
            "신분에 따라 생활이 달랐다",
            "신분과 관계없이 같은 일을 했다",
            "모두 같은 기회를 누렸다",
            "전문 기술은 주로 상민이 맡았다"
          ],
          "a": 0,
          "why": "개인마다 차이가 있었지만 신분에 따른 차이가 존재했어요."
        },
        "pairs": [
          [
            "유교를 공부하거나 관리가 되어 나랏일을 함",
            "양반"
          ],
          [
            "의술·통역 등 전문 기술을 맡음",
            "중인"
          ],
          [
            "주로 농사·장사를 하며 세금과 여러 의무를 짐",
            "상민"
          ],
          [
            "가장 낮은 신분으로, 노비 등이 속함",
            "천민"
          ]
        ],
        "hint": "전문 기술을 맡은 중인과 농사·장사를 한 상민을 구분해요.",
        "art": "statuses7",
        "pairArt": ["npc-roles:4", "npc-roles:3", "npc-roles:2", "npc-roles:5"],
        "learnTitle": "신분에 따라 달랐던 생활",
        "checkArt": "statuses7",
        "recordActivities": [
          {
            "type": "compare",
            "panels": [
              {
                "art": "statuses7",
                "label": "네 사람의 생활",
                "note": "공부와 나랏일 · 전문 기술 · 농사와 장사 · 노비의 일"
              }
            ],
            "prompt": "네 사람을 함께 살펴 알 수 있는 사실은?",
            "options": [
              "신분과 관계없이 맡는 일과 기회가 모두 같았어요.",
              "전문 기술을 맡은 사람들은 주로 상민이었어요.",
              "신분에 따라 맡는 일과 누리는 기회가 달랐어요."
            ],
            "answer": 2,
            "summary": "조선 시대에는 신분에 따라 맡는 일과 의무, 누리는 기회가 달랐어요."
          }
        ]
      },
      {
        "id": 11,
        "ch": 2,
        "title": "두 세대의 가족 기록",
        "type": "sort",
        "goal": "조선 전기와 후기의 기록을 나누어 비교해요.",
        "record": "조선 전기에는 아들과 딸이 재산을 고르게 물려받고 제사를 돌아가며 맡기도 했지만, 후기에 여성의 지위가 낮아졌다.",
        "check": {
          "q": "두 기록을 비교해 알 수 있는 변화는?",
          "options": [
            "후기로 갈수록 아들과 딸이 재산을 똑같이 물려받고, 집안의 제사도 더 고르게 나누었어요.",
            "유교 질서가 강해지면서 여성의 지위가 낮아지고 남성 중심의 생활이 널리 퍼졌어요.",
            "전기와 후기에 옷과 집은 달라져도 재산 상속과 제사 관행은 그대로 이어졌어요.",
            "후기에 아들 중심의 제사가 널리 퍼졌으므로, 전기에도 모든 집에서 아들만 제사를 맡았어요."
          ],
          "a": 1,
          "why": "조선 전기에는 아들과 딸이 재산을 고르게 물려받고 제사를 돌아가며 지냈어요. 후기로 갈수록 여성의 지위가 낮아지고 남성 중심의 유교 질서가 강화되었어요.",
          "artPair": [
            "family5:0",
            "family5:1"
          ]
        },
        "groups": [
          "전기의 모습",
          "후기의 변화"
        ],
        "items": [
          [
            "아들과 딸에게 재산을 고르게 나누기도 함",
            0
          ],
          [
            "자녀가 돌아가며 제사를 맡기도 함",
            0
          ],
          [
            "여성의 사회적 지위가 점차 낮아짐",
            1
          ],
          [
            "남성 중심의 유교 질서가 더 강해짐",
            1
          ]
        ],
        "hint": "고르게 나눈 기록과 남성 중심으로 달라진 기록을 비교해요.",
        "art": "chapter3:4",
        "learnTitle": "가족의 모습도 달라졌어요",
        "checkArtPair": [
          "family5:0",
          "family5:1"
        ],
        "checkArtLabels": [
          "조선 전기 · 아들과 딸이 함께",
          "조선 후기 · 남성 중심 질서 강화"
        ],
        "recordActivities": [
          {
            "type": "link",
            "pairs": [
              {
                "art": "family5:0",
                "label": "조선 전기",
                "text": "아들과 딸이 재산을 고르게 물려받고 제사를 나누기도 했어요."
              },
              {
                "art": "family5:1",
                "label": "조선 후기",
                "text": "남성 중심의 질서가 강해지고 여성의 지위가 낮아졌어요."
              }
            ],
            "summary": "조선 후기로 갈수록 남성 중심의 유교 질서가 강화되고 여성의 지위가 낮아졌어요.",
            "prompt": "각 가족 그림에 맞는 기록을 선택란에서 골라 연결해요."
          }
        ]
      }
    ]
  }
};
const art = {"farm4:3":{"src":"assets/chapter-media/v4-farm-evidence.webp","size":[1536,1024],"rect":[768,512,768,512]},"farm4:1":{"src":"assets/chapter-media/v4-farm-evidence.webp","size":[1536,1024],"rect":[768,0,768,512]},"instruments:3":{"src":"assets/chapter-media/v2-instruments.webp","size":[1536,1024],"rect":[768,512,768,512]},"instruments:0":{"src":"assets/chapter-media/v2-instruments.webp","size":[1536,1024],"rect":[0,0,768,512]},"instruments:1":{"src":"assets/chapter-media/v2-instruments.webp","size":[1536,1024],"rect":[768,0,768,512]},"instruments:2":{"src":"assets/chapter-media/v2-instruments.webp","size":[1536,1024],"rect":[0,512,768,512]},"chapter2:2":{"src":"assets/chapter-media/v2-chapter2.webp","size":[1536,1024],"rect":[1024,0,512,512]},"farm4:0":{"src":"assets/chapter-media/v4-farm-evidence.webp","size":[1536,1024],"rect":[0,0,768,512]},"farm4:2":{"src":"assets/chapter-media/v4-farm-evidence.webp","size":[1536,1024],"rect":[0,512,768,512]},"chapter2:4":{"src":"assets/chapter-media/v2-chapter2.webp","size":[1536,1024],"rect":[512,512,512,512]},"chapter2:5":{"src":"assets/chapter-media/v2-chapter2.webp","size":[1536,1024],"rect":[1024,512,512,512]},"diplomacy:0":{"src":"assets/chapter-media/v2-diplomacy.webp","size":[1536,1024],"rect":[0,0,512,1024]},"diplomacy:1":{"src":"assets/chapter-media/v2-diplomacy.webp","size":[1536,1024],"rect":[512,0,512,1024]},"diplomacy:2":{"src":"assets/chapter-media/v2-diplomacy.webp","size":[1536,1024],"rect":[1024,0,512,1024]},"samgang":{"src":"assets/chapter-media/v2-samgang.webp"},"npc-roles:3":{"src":"assets/chapter-media/v2-npc-roles.webp","size":[1536,1024],"rect":[1152,0,384,512]},"family5:0":{"src":"assets/chapter-media/v5-folk5.webp","size":[1536,1024],"rect":[0,512,768,512],"name":"조선 전기 상속"},"family5:1":{"src":"assets/chapter-media/v5-folk5.webp","size":[1536,1024],"rect":[768,512,768,512],"name":"조선 후기 가족"},"education:0":{"src":"assets/chapter-media/v5-education.webp","size":[1536,1024],"rect":[512,0,512,512],"name":"성균관"},"education:1":{"src":"assets/chapter-media/v5-education.webp","size":[1536,1024],"rect":[0,512,512,512],"name":"향교"},"education:2":{"src":"assets/chapter-media/v5-education.webp","size":[1536,1024],"rect":[0,0,512,512],"name":"서당"},"chapter3:0":{"src":"assets/chapter-media/v2-chapter3.webp","size":[1536,1024],"rect":[0,0,512,512]},"statuses7":{"src":"assets/chapter-media/v7-social-groups.webp","name":"네 사람의 신분과 서로 다른 일","size":[1536,1024]},"chapter3:4":{"src":"assets/chapter-media/v2-chapter3.webp","size":[1536,1024],"rect":[512,512,512,512]},"chapter2:3":{"src":"assets/chapter-media/v2-chapter2.webp","size":[1536,1024],"rect":[0,512,512,512]},"chapter3:1":{"src":"assets/chapter-media/v2-chapter3.webp","size":[1536,1024],"rect":[512,0,512,512]},"chapter3:2":{"src":"assets/chapter-media/v2-chapter3.webp","size":[1536,1024],"rect":[1024,0,512,512]},"chapter3:3":{"src":"assets/chapter-media/v2-chapter3.webp","size":[1536,1024],"rect":[0,512,512,512]}};
const media = {"farm":{"src":"assets/chapter-media/v6-video-farm.mp4","poster":"assets/chapter-media/v6-video-farm.jpg"},"observatory":{"src":"assets/chapter-media/v6-video-observatory-r2.mp4","poster":"assets/chapter-media/v6-video-observatory-r2.jpg"},"waterclock":{"src":"assets/chapter-media/v6-video-waterclock-r2.mp4","poster":"assets/chapter-media/v6-video-waterclock-r2.jpg"},"hangul":{"src":"assets/chapter-media/v7-video-hangul.mp4","poster":"assets/chapter-media/v7-video-hangul.jpg"},"relations":{"src":"assets/chapter-media/v6-video-relations.mp4","poster":"assets/chapter-media/v6-video-relations.jpg"}};

// Reuse the same scholar, physician, farmer and servant frames as the original four-person activity.
for(const i of [4,2,5])art['npc-roles:'+i]={...art['npc-roles:3'],rect:[i%4*384,Math.floor(i/4)*512,384,512]};
Object.assign(art,{
 'weather:0':{src:'assets/chapter-media/v11-observatory-sunny.webp',name:'해가 비치고 그림자가 생긴 맑은 낮'},
 'weather:1':{src:'assets/chapter-media/v11-observatory-cloudy-v20.webp',name:'회색 구름이 해를 가린 흐린 낮'},
 'weather:2':{src:'assets/chapter-media/v2-map-observatory.webp',name:'해가 없는 밤의 관측소'}
});
Object.assign(chapters,chapters456,chapters78);
Object.assign(art,art456,art78);
Object.assign(media,media456,media78);
const match = (prompt, pairs, pictures=[]) => ({kind:'match',prompt,pairs,pictures});
const choice = q => ({kind:'choice',prompt:q.q,options:q.options,answer:q.a,why:q.why,art:q.art,artPair:q.artPair,artLabels:q.artLabels,optionArt:q.optionArt});
const tools=[['sky','혼천의','천체의 위치와 움직임을 살펴요.'],['rain','측우기','그릇에 고인 빗물의 깊이를 재요.'],['sun','앙부일구','해 그림자로 시각을 알아요.'],['water','자격루','물의 흐름으로 시각을 알아요.']];
const requests=[['맑은 낮, 비가 그쳤어요','내린 비의 양과 지금 시각을 기록해요.'],['해가 보이지 않는 흐린 낮','비의 양과 지금 시각을 알아야 해요.'],['별이 뜬 밤의 관측소','천체의 움직임과 지금 시각을 관측해요.']];
const laws=['혼인: 남자 15세, 여자 14세부터','땅·집 거래: 100일 안에 관청에 보고','부모가 70세 이상이거나 많이 아프면 아들 중 한 명은 군대에 가지 않음'];
const cases=[['14세 딸의 혼인을 신고했어요. 당시 조항에 맞을까요?',0,0,'당시 법에서는 여자는 14세부터 혼인할 수 있었어요. 오늘날 법과는 달라요.'],['땅을 산 지 120일이 지났는데 아직 신고하지 않았어요. 기한에 맞을까요?',1,1,'땅과 집의 거래는 100일 안에 보고해야 했으므로 기한을 넘겼어요.'],['70세 부모를 모시는 아들 한 명이 군역 면제를 요청했어요. 해당할까요?',2,0,'부모가 70세 이상일 때 아들 한 명의 군역을 면제하는 조항에 해당해요.']];
function recordStep(r){
 if(r.type==='link')return {...match(r.prompt,r.pairs.map(p=>[p.label,p.text]),r.pairs.map(p=>p.art)),why:r.summary,record:true};
 return {kind:'choice',prompt:r.type==='blank'?r.before+'[ 빈칸 ]'+r.after:r.prompt,options:r.options,answer:r.answer,why:r.summary,record:true,art:r.art||r.panels?.[0]?.art,artPair:r.panels?.length>1?r.panels.map(p=>p.art):undefined,artLabels:r.panels?.map(p=>p.label)};
}
export function lessonSteps(chapter,index){
 const m=chapters[chapter]?.missions[index];if(!m)return [];
 let actions=m.id>=24?steps78(m):m.id>=12?extendedSteps(m):[];
 if(m.id===4)actions=[{kind:'evidence',prompt:m.goal,cards:m.cards,need:m.need,pictures:m.cardArt,why:m.record}];
 if(m.id===5)actions=requests.map((r,i)=>({kind:'tools',prompt:r[0],note:r[1],request:i,why:['비의 양은 측우기로, 시각은 앙부일구나 자격루로 알아요.','햇빛이 없으면 해 그림자를 쓸 수 없어요. 측우기와 자격루를 사용해요.','밤에는 혼천의로 천체를, 자격루로 시각을 관측해요.'][i],scene:'weather:'+i,art:'weather:'+i}));
 if(m.id===6)actions=[{kind:'choice',prompt:'“말하고 싶은 것은 많은데, 글을 몰라 제 뜻을 전하기 어려워요.”',options:['백성이 쉽게 배워 뜻을 전할 글자가 필요해요.','더 어려운 글자를 만들어야 해요.','백성이 글 쓰는 일을 막아야 해요.'],answer:0,why:'한자는 배우기 어렵고 우리말과 달라 불편했어요. 세종은 백성이 쉽게 읽고 쓰기를 바랐어요.',art:'chapter2:3'},...['물','밥'].map((word,i)=>({kind:'letters',prompt:i?'굶은 이웃에게 밥을 나누고 싶어요.':'목이 말라요. 물을 주세요.',word,answer:i?['ㅂ','ㅏ','ㅂ']:['ㅁ','ㅜ','ㄹ'],why:`「${word}」을 글로 적어 생활 속 뜻을 전했어요.`,art:'chapter2:2'}))];
 if(m.id===7||m.id===8||m.id===10)actions=[{...match(m.goal,m.pairs,m.pairArt||[]),why:m.record,art:m.art,context:m.context,contextTitle:m.contextTitle||(m.id===7?'세 나라에서 온 소식':undefined)}];
 if(m.id===9)actions=cases.map((c,i)=>({kind:'trial',prompt:c[0],law:c[1],answer:c[2],why:c[3],art:'chapter3:'+(i+1)}));
 if(m.id===11)actions=[{kind:'sort',prompt:m.goal,items:m.items,groups:m.groups,why:m.record,art:'family5:0'}];
 return [...actions,choice({...m.check,art:m.check.art||m.checkArt||m.art,artPair:m.check.artPair||m.checkArtPair,artLabels:m.check.artLabels||m.checkArtLabels}),...m.recordActivities.map(recordStep)];
}
// Every saved answer is checked against the same rule as live submissions; a stage number cannot skip an activity.
export function isCorrect(step,a){
 if(!step)return false;
 if(['route','naval','allocation','trade','research'].includes(step.kind))return extendedCorrect(step,a);
 if(step.kind==='choice')return Number.isInteger(a)&&a===step.answer;
 if(step.kind==='letters')return Array.isArray(a)&&JSON.stringify(a)===JSON.stringify(step.answer);
 if(step.kind==='evidence')return Array.isArray(a)&&a.length===step.need&&new Set(a).size===a.length&&(step.validSets?step.validSets.some(set=>set.length===a.length&&set.every(n=>a.includes(n))):a.every(i=>Number.isInteger(i)&&step.cards[i]?.tag==='yes'));
 if(step.kind==='tools')return Array.isArray(a)&&a.length===2&&new Set(a).size===2&&(step.request===0?a.includes('rain')&&(a.includes('sun')||a.includes('water')):step.request===1?a.includes('rain')&&a.includes('water'):a.includes('sky')&&a.includes('water'));
 if(step.kind==='match')return Array.isArray(a)&&a.length===step.pairs.length&&a.every((v,i)=>v===i);
 if(step.kind==='sort')return Array.isArray(a)&&a.length===step.items.length&&a.every((v,i)=>v===step.items[i][1]);
 if(step.kind==='trial')return Array.isArray(a)&&a.length===2&&a[0]===step.law&&a[1]===step.answer;
 return false;
}
const fresh=()=>({version:1,missions:Array.from({length:4},()=>({answers:[],complete:false})),review:[],penalties:[]});
export function restoreChapter(chapter,raw){
 const p=fresh();let x;try{x=typeof raw==='string'?JSON.parse(raw):raw;}catch{return p;}if(!x||x.version!==1)return p;
 for(let i=0;i<4;i++){const s=x.missions?.[i],steps=lessonSteps(chapter,i);if(!s||!Array.isArray(s.answers))continue;for(let j=0;j<steps.length;j++){if(!isCorrect(steps[j],s.answers[j]))break;p.missions[i].answers.push(structuredClone(s.answers[j]));}p.missions[i].complete=s.complete===true&&p.missions[i].answers.length===steps.length;}
 if(p.missions.every(m=>m.complete)&&Array.isArray(x.review)){for(let i=0;i<3;i++){if(!isCorrect(choice(chapters[chapter].review[i]),x.review[i]))break;p.review.push(x.review[i]);}}
 if(Array.isArray(x.penalties))p.penalties=[...new Set(x.penalties.filter(k=>typeof k==='string'&&/^(m[0-3]s[0-9]+|r[0-2]):[\w\[\],":-]{1,1200}$/.test(k)))].slice(0,500);
 return p;
}
export function createChapterProgress(chapter,raw){
 if(!chapters[chapter])throw new RangeError('지원하지 않는 장');const p=restoreChapter(chapter,raw);
 const state=()=>({...structuredClone(p),done:p.missions.flatMap((m,i)=>m.complete?[i]:[]),reviewDone:p.review.map((_,i)=>i),score:Math.max(0,1000+p.missions.filter(m=>m.complete).length*10-p.penalties.length*10),complete:p.review.length===3});
 function fail(key,answer,free=false){const signature=key+':'+JSON.stringify(answer);const charged=!free&&!p.penalties.includes(signature);if(charged)p.penalties.push(signature);return {correct:false,charged};}
 return {state,reset(){Object.assign(p,fresh());},submit(i,a){if(!Number.isInteger(i)||i<0||i>3)return {locked:true};const m=p.missions[i],step=lessonSteps(chapter,i)[m.answers.length];if(m.complete||!step)return {correct:true,finished:true};if(['tools','evidence'].includes(step.kind)&&Array.isArray(a))a=[...a].sort();if(!isCorrect(step,a))return fail(`m${i}s${m.answers.length}`,a,step.kind==='letters'||step.free===true);m.answers.push(structuredClone(a));return {correct:true,finished:m.answers.length===lessonSteps(chapter,i).length};},commit(i){const m=p.missions[i];if(!m||m.complete||m.answers.length!==lessonSteps(chapter,i).length)return false;m.complete=true;return true;},review(a){if(p.missions.some(m=>!m.complete))return {locked:true};if(p.review.length===3)return {correct:true,finished:true};const i=p.review.length;if(!isCorrect(choice(chapters[chapter].review[i]),a))return fail('r'+i,a);p.review.push(a);return {correct:true,finished:p.review.length===3};}};
}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let serial=0;
function picture(ref,label='역사 학습을 위한 창작 삽화'){
 const a=art[ref];if(!a)return '';if(ref==='painting'&&label==='역사 학습을 위한 창작 삽화')label='김홍도 벼타작 · 국립중앙박물관';if(!a.rect)return `<img class="chapter-picture" src="${a.src}" alt="${esc(label)}">`;
 const id='chapter-crop-'+ ++serial;return `<svg class="chapter-picture" viewBox="${a.rect.join(' ')}" role="img" aria-label="${esc(label)}"><defs><clipPath id="${id}"><rect x="${a.rect[0]}" y="${a.rect[1]}" width="${a.rect[2]}" height="${a.rect[3]}"/></clipPath></defs><image href="${a.src}" width="${a.size[0]}" height="${a.size[1]}" clip-path="url(#${id})"/></svg>`;
}
const shuffled=a=>{const r=[...a];for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;};
export function createChapterLessons({chapter,pause=()=>{},resume=()=>{},onComplete=()=>{},notice=()=>{}}){
 const c=chapters[chapter];if(!c)throw new RangeError('지원하지 않는 장');
 const qa=new URLSearchParams(location.search).get('qa');const key=`joseon3d-chapter-${chapter}`+(qa!==null?'-qa-'+qa.slice(0,40):'');let raw;try{raw=localStorage.getItem(key);}catch{}
 const progress=createChapterProgress(chapter,raw),dialog=document.querySelector('#dialog');let active=false,cleanup=()=>{},current=0,navalAttempt=0;
 const $=s=>dialog.querySelector(s);const bind=(id,fn)=>{const b=$('#'+id);if(b)b.onclick=fn;};
 if(!document.querySelector('#chapter-lesson-style')){const style=document.createElement('style');style.id='chapter-lesson-style';style.textContent=`
.chapter-lessons{color:#293f3a}
.chapter-lessons .chapter-study{padding:12px;border-radius:12px;background:#efe7d5;margin-bottom:14px;text-align:center}.chapter-lessons .chapter-study .chapter-picture{max-height:340px}.chapter-lessons #chapter-study-picture.is-large{max-height:65dvh;overflow:auto}.chapter-lessons #chapter-study-picture.is-large .chapter-picture{max-height:none;min-width:600px}.chapter-lessons .chapter-stage{position:relative;max-width:700px;margin:0 auto 14px;overflow:hidden;border-radius:14px}.chapter-lessons .chapter-stage>.chapter-picture{max-height:320px;width:100%;object-fit:cover}.chapter-lessons .chapter-stage-actors{position:absolute;inset:28% 10% 0;display:flex;align-items:flex-end;justify-content:center}.chapter-lessons .chapter-stage-person{width:33%;height:100%;object-fit:contain;filter:brightness(.2);opacity:.35;transition:filter .4s,opacity .4s,transform .4s}.chapter-lessons .chapter-stage-person.present{filter:none;opacity:1;transform:translateY(-3px)}.chapter-lessons .chapter-newspaper{background:#f0e8d5;border:1px solid #b9a887;padding:14px;margin-bottom:14px}.chapter-lessons .chapter-newspaper>h3{border-bottom:3px double #655638;text-align:center;padding-bottom:8px}.chapter-lessons .chapter-newspaper .chapter-picture{max-height:100px}
@media(prefers-reduced-motion:reduce){.chapter-lessons .chapter-stage-person{transition:none}}

.chapter-lessons .chapter-route-layout{display:grid;grid-template-columns:minmax(280px,1fr) minmax(180px,.8fr);gap:18px;align-items:start}
.chapter-lessons .chapter-route{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;max-width:420px;margin:auto;background:#dbd4b7;padding:6px;border-radius:14px}
.chapter-lessons .chapter-route button{padding:1px;border-radius:7px;min-height:42px;height:46px;font-size:12px;background:#f7f2d9;color:#294734;border:1px solid #b5bd9f}
.chapter-lessons .chapter-route button:disabled{opacity:1;cursor:default}.chapter-lessons .chapter-route .route-block{background:#a4b59a;color:#354f32}.chapter-lessons .chapter-route .route-trail{background:#d3e2ba}.chapter-lessons .chapter-route .route-current{background:#315d46;color:white;font-size:24px;border:2px solid #162f26}
.chapter-lessons .chapter-work-status,.chapter-lessons .chapter-inventory{padding:12px 16px;background:#e5ecd9;border-radius:10px;font-size:16px;color:#284b36}

.chapter-lessons .chapter-resource-head{display:grid;grid-template-columns:200px 1fr;gap:18px;align-items:center;margin-bottom:12px}.chapter-lessons .chapter-resource-head .chapter-picture{height:145px;object-fit:cover}.chapter-lessons .chapter-stock{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:10px}.chapter-lessons .chapter-counter{display:flex;gap:7px;align-items:center;justify-content:space-between;margin-top:9px}.chapter-lessons .chapter-counter button{width:44px;min-width:44px;min-height:44px;padding:0;font-size:21px}.chapter-lessons .chapter-counter strong{font-size:22px}
.chapter-lessons .chapter-market{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:12px 0}.chapter-lessons .chapter-market .chapter-picture{height:110px}.chapter-lessons .chapter-market button{font-size:13px;padding:8px;margin-top:8px}.chapter-lessons .chapter-research-cases{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:10px 0 18px;text-align:center}.chapter-lessons .chapter-research-cases .chapter-picture{height:115px}.chapter-lessons [data-research]{margin-top:4px}.chapter-lessons .chapter-card>label{display:block;margin-top:10px;font-size:14px;font-weight:700}
@media(max-width:650px){.chapter-lessons .chapter-route-layout{grid-template-columns:1fr}.chapter-lessons .chapter-route-layout>.chapter-card{display:grid;grid-template-columns:1fr 1fr;gap:6px}.chapter-lessons .chapter-route-layout>.chapter-card>.chapter-picture{display:none}.chapter-lessons .chapter-route button{height:44px;min-height:44px;font-size:10px}.chapter-lessons .chapter-route{gap:2px;padding:2px}.chapter-lessons .chapter-resource-head{grid-template-columns:110px 1fr;gap:10px}.chapter-lessons .chapter-resource-head .chapter-picture{height:110px}.chapter-lessons .chapter-stock{grid-template-columns:repeat(2,minmax(0,1fr))}.chapter-lessons .chapter-stock .chapter-card{padding:10px}.chapter-lessons .chapter-stock p{font-size:12px}.chapter-lessons .chapter-market{grid-template-columns:1fr}.chapter-lessons .chapter-market .chapter-card{display:grid;grid-template-columns:80px 1fr;gap:6px 10px;align-items:center}.chapter-lessons .chapter-market .chapter-picture{grid-row:1/4;height:80px}.chapter-lessons .chapter-market p,.chapter-lessons .chapter-market b{margin:0}.chapter-lessons .chapter-market button{margin:0;min-height:44px}.chapter-lessons .chapter-research-cases .chapter-picture{height:75px}.chapter-lessons .chapter-research-cases b{font-size:12px}.chapter-lessons .chapter-work-status,.chapter-lessons .chapter-inventory{font-size:14px}}

.chapter-lessons .sheet-head{align-items:flex-start;gap:16px;margin-bottom:12px}
.chapter-lessons .sheet-head h2{font-size:clamp(20px,2.2vw,27px);line-height:1.35;margin:5px 0 0;word-break:keep-all}
.chapter-lessons .sheet-head .quiet{flex-shrink:0;max-width:160px;min-height:44px}
.chapter-lessons h3{font-size:clamp(18px,1.8vw,22px);line-height:1.55;margin:10px 0 12px;word-break:keep-all}
.chapter-lessons .chapter-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.chapter-lessons .chapter-picture{display:block;width:100%;height:auto;max-height:200px;object-fit:contain;border-radius:10px;overflow:hidden}
.chapter-lessons .chapter-card{position:relative;background:#fffdf5;color:#2d443b;border:2px solid #d8cfb9;border-radius:14px;padding:12px;text-align:left}
.chapter-lessons .chapter-card b{display:block;margin-top:6px;font-size:16px;line-height:1.5}
.chapter-lessons .chapter-card p{margin:5px 0 0;font-size:14px;line-height:1.65}
.chapter-lessons .choice{position:relative;margin:0;padding:13px 15px;border:2px solid #d8cfb9;border-radius:12px;font-size:15px;line-height:1.6;background:#fffdf5;color:#2d443b}
.chapter-lessons .choice:hover{background:#f3f4e8;border-color:#849881}
.chapter-lessons button[aria-pressed="true"],.chapter-lessons button.is-selected{background:#e0eed9;color:#203e2b;border:2px solid #397549;box-shadow:0 0 0 2px #39754928}
.chapter-lessons .chapter-select-mark{display:inline-flex;align-items:center;justify-content:center;min-width:52px;min-height:24px;font-size:12px;line-height:1;padding:5px 8px;border-radius:20px;background:#eee9db;color:#677465;position:absolute;right:8px;top:8px}
.chapter-lessons button[aria-pressed="true"] .chapter-select-mark{background:#397549;color:white}
.chapter-lessons .chapter-tools{grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.chapter-lessons .chapter-tools .chapter-card{padding:32px 10px 12px;text-align:center}
.chapter-lessons .chapter-tools .chapter-picture{height:100px;max-height:100px}
.chapter-lessons .chapter-tools .chapter-card p{font-size:13px;line-height:1.5}
.chapter-lessons .chapter-evidence .chapter-card{padding:32px 12px 12px}
.chapter-lessons .chapter-evidence .chapter-picture{height:125px;max-height:125px}
.chapter-lessons .chapter-weather{display:grid;grid-template-columns:minmax(160px,.8fr) minmax(0,1.2fr);align-items:center;gap:18px;padding:12px;background:#edf1e6;border:1px solid #d7dfcb;border-radius:14px;margin:10px 0 12px}
.chapter-lessons .chapter-weather .chapter-picture{height:150px;max-height:150px}
.chapter-lessons .chapter-weather b{font-size:17px;line-height:1.5}
.chapter-lessons .chapter-weather p{font-size:15px;line-height:1.65;margin:6px 0 0}
.chapter-lessons .chapter-progress{font-size:12px;font-weight:700;color:#6b765f;letter-spacing:.04em;margin:6px 0}
.chapter-lessons .chapter-instruction{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;background:#f1ecdd;border-radius:10px;margin-bottom:12px;font-size:14px;line-height:1.5}
.chapter-lessons #chapter-selection{color:#315e3d;font-weight:700;white-space:nowrap}
.chapter-lessons .chapter-choice-layout{display:grid;grid-template-columns:minmax(160px,.8fr) minmax(0,1.2fr);gap:20px;align-items:center}
.chapter-lessons .chapter-answers{display:grid;gap:10px}
.chapter-lessons .chapter-art-pair{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center}
.chapter-lessons .chapter-art-pair .chapter-picture{max-height:170px}
.chapter-lessons .chapter-option-picture{display:grid;grid-template-columns:64px minmax(0,1fr);align-items:center;gap:10px}
.chapter-lessons .chapter-option-picture .chapter-picture{height:64px;max-height:64px}
.chapter-lessons .chapter-match-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.chapter-lessons .chapter-row{display:grid;gap:10px;margin:0;padding:12px;background:#f3eddd;border:1px solid #ddd4bd;border-radius:12px;min-width:0}
.chapter-lessons .chapter-row label{font-size:15px;line-height:1.6;word-break:keep-all}
.chapter-lessons .chapter-match-label{display:grid;grid-template-columns:80px minmax(0,1fr);align-items:center;gap:12px}
.chapter-lessons .chapter-match-label .chapter-picture{height:95px;max-height:95px}
.chapter-lessons select{width:100%;max-width:100%;min-height:48px;padding:9px;font:inherit;color:#29413f;background:#fffdf6;border:1px solid #9eae95;border-radius:9px}
.chapter-lessons .chapter-row select.has-choice{border:2px solid #397549;background:#f4f9ef}
.chapter-lessons .chapter-row .chapter-caption:empty{display:none}
.chapter-lessons .chapter-row .chapter-caption{font-size:13px;line-height:1.65;margin:8px 0 0;overflow-wrap:anywhere}
.chapter-lessons .chapter-context{margin:8px 0 14px;border:1px solid #c7d1ba;border-radius:12px;padding:10px 12px;background:#f4f6eb}
.chapter-lessons .chapter-question-art figure{margin:0;min-width:0}.chapter-lessons .chapter-question-art figcaption{font-size:13px;color:#37523f;text-align:center;font-weight:700;margin-top:6px;line-height:1.5}
.chapter-lessons .chapter-context summary{font-size:14px;font-weight:700;cursor:pointer;min-height:44px;line-height:44px}
.chapter-lessons .chapter-context .chapter-grid{grid-template-columns:repeat(2,minmax(0,1fr));margin-top:8px}
.chapter-lessons .chapter-context .chapter-picture{max-height:110px}
.chapter-lessons .chapter-comparison{margin-bottom:14px}
.chapter-lessons .chapter-comparison .chapter-picture{height:130px;max-height:130px}
.chapter-lessons .chapter-comparison b{display:block;font-size:14px;margin-top:6px;text-align:center}
.chapter-lessons .chapter-letter-layout{display:grid;grid-template-columns:1fr 1.2fr;gap:24px;align-items:center}
.chapter-lessons .chapter-letters{display:flex;justify-content:center;gap:10px;margin:12px 0 16px}
.chapter-lessons .chapter-letters span{width:54px;min-height:60px;border-bottom:3px solid #a17c38;font-size:34px;text-align:center}
.chapter-lessons .chapter-chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.chapter-lessons .chapter-chips button{width:auto;min-width:52px}
.chapter-lessons .chapter-trial .chapter-card>.choice{margin-top:8px;font-size:14px;padding:10px 12px}
.chapter-lessons .chapter-trial .chapter-picture{max-height:185px}
.chapter-lessons .chapter-footer{margin-top:16px;padding-top:12px;border-top:1px solid #d8d1ba}
.chapter-lessons #chapter-feedback{font-size:14px;line-height:1.6;color:#92502f;margin:0 0 8px}
.chapter-lessons #chapter-feedback:empty{display:none}
.chapter-lessons #chapter-submit{background:#315f43;color:white;max-width:600px;display:block;margin:auto}
.chapter-lessons #chapter-submit:disabled{background:#73836f;opacity:.6}
.chapter-lessons .chapter-caption{font-size:12px;color:#65715f;line-height:1.6;margin:8px 0}
.chapter-lessons .chapter-footer>.chapter-caption{text-align:center;margin-bottom:0}
.chapter-lessons .chapter-cinema{position:relative;background:#132b31;border-radius:16px;overflow:hidden}
.chapter-lessons video{display:block;width:100%;max-height:62dvh;object-fit:contain}
.chapter-lessons #chapter-skip{position:absolute;top:12px;right:12px;width:44px;height:44px;padding:0;min-height:44px}
.chapter-lessons #chapter-retry{position:absolute;left:10%;bottom:12px;width:80%;background:#f5dfad;color:#29413f}
.chapter-lessons .chapter-intro{align-items:center}
.chapter-lessons .chapter-record{max-width:800px;margin:auto;text-align:center}
.chapter-lessons .chapter-record .chapter-picture{max-height:210px}
.chapter-lessons .chapter-record p{font-size:17px;line-height:1.75}
.chapter-lessons button:focus-visible,.chapter-lessons select:focus-visible,.chapter-lessons summary:focus-visible{outline:3px solid #8b572a;outline-offset:3px}
@media(max-width:850px){.chapter-lessons .chapter-tools{grid-template-columns:repeat(2,minmax(0,1fr))}.chapter-lessons .chapter-tools .chapter-picture{height:80px;max-height:80px}.chapter-lessons .chapter-tools .chapter-card{display:grid;grid-template-columns:80px minmax(0,1fr);align-items:center;column-gap:8px;padding:30px 10px 10px;text-align:left}.chapter-lessons .chapter-tools .chapter-card .chapter-picture{grid-row:1/3}.chapter-lessons .chapter-tools .chapter-card b{margin:0}.chapter-lessons .chapter-tools .chapter-card p{margin:3px 0}}
@media(max-width:650px){.chapter-lessons .sheet-head{gap:10px}.chapter-lessons .sheet-head .quiet{max-width:98px;font-size:11px;padding:8px}.chapter-lessons .chapter-grid{gap:10px}.chapter-lessons .chapter-picture{max-height:145px}.chapter-lessons .chapter-choice-layout,.chapter-lessons .chapter-letter-layout{grid-template-columns:1fr;gap:12px}.chapter-lessons .chapter-choice-layout>.chapter-question-art .chapter-picture{max-height:125px}.chapter-lessons .chapter-letter-layout>.chapter-picture{max-height:110px}.chapter-lessons .chapter-weather{grid-template-columns:1fr 1fr;gap:10px;padding:8px}.chapter-lessons .chapter-weather .chapter-picture{height:120px;max-height:120px}.chapter-lessons .chapter-weather b{font-size:14px}.chapter-lessons .chapter-weather p{font-size:13px}.chapter-lessons .chapter-weather .chapter-progress{font-size:11px}.chapter-lessons .chapter-tools .chapter-card{display:block;text-align:center;padding:29px 8px 10px}.chapter-lessons .chapter-tools .chapter-picture{height:76px;max-height:76px}.chapter-lessons .chapter-tools .chapter-card b{font-size:15px;margin-top:5px}.chapter-lessons .chapter-tools .chapter-card p{font-size:13px;line-height:1.5}.chapter-lessons .chapter-evidence .chapter-picture{height:90px;max-height:90px}.chapter-lessons .chapter-evidence .chapter-card{padding:30px 9px 10px}.chapter-lessons .chapter-card b{font-size:15px}.chapter-lessons .chapter-card p{font-size:13px;line-height:1.65}.chapter-lessons .chapter-match-grid{grid-template-columns:1fr}.chapter-lessons .chapter-match-label{grid-template-columns:64px minmax(0,1fr);gap:10px}.chapter-lessons .chapter-match-label .chapter-picture{height:75px;max-height:75px}.chapter-lessons .chapter-row{padding:10px}.chapter-lessons .chapter-row label,.chapter-lessons .choice{font-size:14px}.chapter-lessons .chapter-context .chapter-grid{grid-template-columns:1fr}.chapter-lessons .chapter-context .chapter-card{display:grid;grid-template-columns:80px minmax(0,1fr);gap:6px 10px}.chapter-lessons .chapter-context .chapter-picture{grid-row:1/3;max-height:95px}.chapter-lessons .chapter-comparison .chapter-picture{height:100px;max-height:100px}.chapter-lessons .chapter-trial{grid-template-columns:1fr}.chapter-lessons .chapter-trial .chapter-picture{max-height:120px}.chapter-lessons .chapter-record p{font-size:15px}.chapter-lessons .chapter-instruction{font-size:13px}.chapter-lessons .chapter-footer{margin-top:12px;padding-top:10px}}
@media(max-width:650px){.chapter-lessons .chapter-intro{grid-template-columns:1fr}.chapter-lessons .chapter-intro .chapter-picture{max-height:125px}}
`;document.head.append(style);}
 if(!document.querySelector('#mission-effects-style')){const link=document.createElement('link');link.id='mission-effects-style';link.rel='stylesheet';link.href=new URL('./mission-effects.css',import.meta.url).href;document.head.append(link);}
 const isReduced=()=>document.querySelector('#motion')?.getAttribute('aria-pressed')==='true'||globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
 const fxFloat=(text,plus)=>`<span class="fx-float ${plus?'fx-plus':'fx-minus'}" aria-hidden="true">${text}</span>`;
 const fxStamp=(html,record)=>`<div class="fx-stamp-wrap">${html}<span class="fx-stamp ${record?'fx-stamp-record':''}" aria-hidden="true">${record?'기록':'확인'}</span></div>`;
 // Returns whether the record reached storage; callers pass it on so a completion message never hides a failed save.
 function save(){try{localStorage.setItem(key,JSON.stringify(progress.state()));return true;}catch{notice('저장을 사용할 수 없어 현재 화면에서만 이어져요.');return false;}}
 const unsavedNote='<p class="chapter-caption" role="status">저장을 사용할 수 없어 이 기록은 새로고침하면 사라져요. 지금 화면에서는 완료로 이어져요.</p>';
 function release(){if(!active)return;active=false;cleanup();cleanup=()=>{};dialog.classList.remove('chapter-lessons');dialog.classList.remove('fx-reduced');resume();}
 dialog.addEventListener('close',release);dialog.addEventListener('cancel',e=>{if(active)e.preventDefault();});
 function close(){cleanup();cleanup=()=>{};if(dialog.open)dialog.close();release();}
 function show(html){cleanup();cleanup=()=>{};active=true;dialog.classList.remove('family-question');dialog.classList.add('chapter-lessons');dialog.classList.toggle('fx-reduced',isReduced());dialog.setAttribute('aria-label',`${chapter}장 ${c.title} 학습 활동`);dialog.innerHTML=html;if(!dialog.open){pause();dialog.showModal();}dialog.scrollTop=0;dialog.setAttribute('tabindex','-1');dialog.focus();bind('chapter-back',close);}
 function header(title){return `<div class="sheet-head"><div><span class="eyebrow">제${chapter}장 · ${esc(c.era)}</span><h2>${esc(title)}</h2></div><button id="chapter-back" class="quiet">탐험으로 돌아가기</button></div>`;}
 function film(clip,next){const m=media[clip];if(!m){next();return;}show(header(c.missions[current].title)+`<div class="chapter-cinema"><video playsinline muted autoplay preload="auto" src="${m.src}" poster="${m.poster}"></video><button id="chapter-skip" hidden aria-label="영상 닫고 계속하기">×</button><button id="chapter-retry" hidden>영상 재생하기</button></div><p class="chapter-caption">학습을 위해 재구성한 창작 영상</p>`);const v=$('video');let finished=false,error=false,played=0,last=0,seeking=false,wall=performance.now();const finish=()=>{if(finished)return;finished=true;next();};const recover=()=>{if(finished)return;error=true;$('#chapter-retry').hidden=false;$('#chapter-retry').textContent='영상을 불러오지 못했어요 · 그림으로 계속';bind('chapter-retry',finish);};const rearm=()=>{last=v.currentTime;wall=performance.now();};v.onended=finish;v.onerror=recover;v.ontimeupdate=()=>{const now=performance.now(),delta=v.currentTime-last;if(!v.paused&&!v.seeking&&!seeking&&!document.hidden&&delta>0)played+=Math.min(delta,(now-wall)/1000+.1);last=v.currentTime;wall=now;if(played>=1)$('#chapter-skip').hidden=false;};v.onplay=rearm;v.onseeking=()=>{seeking=true;rearm();};v.onseeked=()=>{seeking=false;rearm();};document.addEventListener('visibilitychange',rearm);const timer=setTimeout(recover,15000);bind('chapter-skip',finish);const play=()=>v.play().then(()=>{if(!finished&&!error)$('#chapter-retry').hidden=true;}).catch(()=>{if(!finished&&!error)$('#chapter-retry').hidden=false;});bind('chapter-retry',play);play();cleanup=()=>{finished=true;clearTimeout(timer);document.removeEventListener('visibilitychange',rearm);v.onended=null;v.onerror=null;v.ontimeupdate=null;v.onplay=null;v.onseeking=null;v.onseeked=null;v.pause();};}
 function intro(i){current=i;const m=c.missions[i];show(header(m.title)+`<div class="chapter-grid chapter-intro"><div>${picture(m.art,m.title)}<p class="chapter-caption">원본 게임의 학습용 창작 삽화</p></div><div><p class="voice">${esc(i===0?c.intro:m.goal)}</p><p>${esc(m.record)}</p><p>${esc(m.hint)}</p>${m.extraNote?`<p class="chapter-caption">${esc(m.extraNote)}</p>`:''}<button id="chapter-begin">${progress.state().missions[i].answers.length?'하던 활동 이어가기':'직접 해 보기'}</button></div></div>`);bind('chapter-begin',()=>{const clip=m.introClip||(chapter===2?['farm','observatory','hangul','relations'][i]:null);if(progress.state().missions[i].answers.length||!clip)activity(i);else film(clip,()=>activity(i));});}
 function feedback(i,step,result,next){if(!result.correct){const p=$('#chapter-feedback');p.textContent=(step.free?'필요한 수량과 남은 물자를 살펴 다시 나누어요. 이 전략 실험에는 감점이 없어요.':step.kind==='letters'?'글자 조각을 다시 살펴봐요. 조합 연습에는 감점이 없어요.':result.charged?'단서와 조건을 다시 살펴봐요. −10점':'같은 답에는 추가 감점이 없어요. 단서와 조건을 다시 살펴봐요.');if(result.charged)p.insertAdjacentHTML('beforeend',fxFloat('−10',false));return;}show(header(step.record?'마지막 기록을 완성했어요':'확인했어요')+`<div class="chapter-record">${fxStamp(picture(step.art||c.missions[i]?.art),step.record)}<p>${esc(step.why||'도구의 쓰임과 날씨에 맞게 골랐어요.')}</p><button id="chapter-next">${step.record?'기록장에 담기':'다음 활동으로 →'}</button></div>`);bind('chapter-next',next);}
 function renderWorkshop(step,title,submit){
  let prevBag=null;
  let answer=step.kind==='allocation'?[0,0,0,0]:step.kind==='research'?[[null,null,null],[null,null,null]]:[],submitted=false;
  const help={route:'현재 위치와 맞닿은 상하좌우 칸을 눌러요. 두 마을을 모두 방문한 뒤 24걸음 안에 깃발에 도착해요.',allocation:'각 물자의 +와 −로 수량을 바꿔요. 최소 수량을 채우고 남김없이 배분한 뒤 확인해요.',trade:'콩을 팔거나 맞바꾸고, 동전으로 필요한 물건을 사요. 쌀 2되·옷감 1필·약초 1묶음 이상을 마련해요.',research:'서로 다른 문제 두 개를 정하고, 각 문제에 알맞은 자료와 연구 방법을 하나씩 골라요.'};
  show(header(title)+`<p class="chapter-progress">직접 해 보는 역사 활동</p><h3>${esc(step.prompt)}</h3><p class="chapter-instruction">${help[step.kind]}</p><div id="chapter-workbench"></div><div class="chapter-footer"><p id="chapter-feedback" role="status"></p><button id="chapter-submit" disabled>활동한 내용 확인하기</button><p class="chapter-caption">${step.free?'물자 배분은 감점 없이 다시 시험할 수 있어요.':'조작하는 동안에는 채점하지 않아요. 확인 버튼으로 답을 확정해요.'}</p></div>`);
  const reset=()=>{prevBag=null;answer=step.kind==='allocation'?[0,0,0,0]:step.kind==='research'?[[null,null,null],[null,null,null]]:[];paint();};
  const opts=(labels,value)=>'<option value="">골라 주세요</option>'+shuffled(labels.map((_,i)=>i)).map(i=>`<option value="${i}" ${value===i?'selected':''}>${esc(labels[i])}</option>`).join('');
  function paint(){
   let html='',ready=false;
   if(step.kind==='route'){
    const s=routeState456(answer);ready=answer.length>0;
    html=`<div class="chapter-route-layout"><div><div class="chapter-route" aria-label="전쟁 소식을 전하는 학습용 지도">${Array.from({length:49},(_,i)=>{const blocked=route456.blocks.includes(i),home=route456.houses.includes(i),current=s.pos===i,near=!blocked&&Math.abs(i%7-s.pos%7)+Math.abs(Math.floor(i/7)-Math.floor(s.pos/7))===1;return `<button type="button" data-route="${i}" class="${blocked?'route-block':''} ${home?'route-house':''} ${i===6?'route-goal':''} ${s.visited.includes(i)?'route-visited':''} ${current&&home?'route-just':''} ${current?'route-current':''} ${answer.includes(i)?'route-trail':''}" ${blocked||(!near&&!current)?'disabled':''} aria-label="${i+1}번 칸 · ${current?'현재 위치':blocked?'산':home?'소식을 전할 마을':i===6?'안전한 곳':'이동할 길'}">${current?'●':blocked?'산':home?s.visited.includes(i)?'전달 ✓':'마을':i===6?'⚑':'·'}</button>`;}).join('')}</div></div><div class="chapter-card">${picture('chapter4:0')}<b>소식 전달 ${s.visited.length} / 2곳</b><p>걸음 ${s.steps} / 24</p><p>${s.pos===6?'깃발에 도착했어요. 두 마을을 모두 들렀는지 확인해요.':s.steps===24?'걸음 수를 다 썼어요. 처음부터 경로를 다시 계획할 수 있어요.':'가까운 마을부터 방문하면 돌아가는 길을 줄일 수 있어요.'}</p><button id="chapter-work-reset" class="quiet">처음 위치로</button><p class="chapter-caption">지형과 거리는 학습용 모형이에요.</p></div></div>`;
   }
   if(step.kind==='allocation'){
    const used=answer.reduce((a,b)=>a+b,0),labels=['식량','땔감','돌봄','예비 물자'];ready=used===step.total;
    html=`<div class="chapter-resource-head">${picture('winter7','추위와 굶주림을 겪은 남한산성')}<div><b>남은 물자 ${step.total-used} / ${step.total}묶음</b><div class="fx-gauge fx-remaining" aria-hidden="true"><span class="fx-gauge-fill" style="width:${100*(step.total-used)/step.total}%"></span></div><p>식량 ${step.minimum[0]} · 땔감 ${step.minimum[1]} · 돌봄 ${step.minimum[2]}묶음 이상</p><p class="chapter-caption">예비 물자에는 남는 만큼 둘 수 있어요. 수량은 학습용이에요.</p></div></div><div class="chapter-stock">${labels.map((label,i)=>`<article class="chapter-card ${i<3&&answer[i]>=step.minimum[i]?'is-met':''}"><b>${label}</b><p>${i<3?'최소 '+step.minimum[i]+'묶음':'남는 물자'}</p><div class="chapter-counter"><button data-stock="${i}" data-delta="-1" ${answer[i]===0?'disabled':''} aria-label="${label} 한 묶음 줄이기">−</button><strong>${answer[i]}</strong><button data-stock="${i}" data-delta="1" ${used===step.total?'disabled':''} aria-label="${label} 한 묶음 늘리기">+</button></div><div class="fx-bundles" aria-hidden="true">${Array.from({length:answer[i]},()=>'<i></i>').join('')}</div></article>`).join('')}</div><button id="chapter-work-reset" class="quiet">다시 배분하기</button>`;
   }
   if(step.kind==='trade'){
    const bag=tradeState456(answer);ready=answer.length>0;
    html=`<div class="chapter-inventory" role="status">${[['money','동전','닢'],['beans','콩','자루'],['rice','쌀','/2되'],['cloth','옷감','/1필'],['herb','약초','/1묶음']].map(([key,label,unit])=>{const d=prevBag?bag[key]-prevBag[key]:0;return `<span class="fx-item ${d>0?'fx-up':d<0?'fx-down':''}">${label} <b>${bag[key]}${unit}</b>${d?fxFloat((d>0?'+':'')+d,d>0):''}</span>`;}).join('')}</div><div class="chapter-market">${[['rice','쌀','되',2,4],['cloth','옷감','필',3,5],['herb','약초','묶음',1,6]].map(([key,label,unit,cost,ref])=>`<article class="chapter-card">${picture('supplies:'+ref,label)}<b>${label} 가게</b><p>1${unit} = 동전 ${cost}닢</p><button data-trade="buy:${key}" ${bag.money<cost?'disabled':''}>동전으로 1${unit} 사기</button>${key!=='herb'?`<button data-trade="barter:${key}" class="quiet" ${bag.beans<2?'disabled':''}>콩 2자루 ↔ ${key==='rice'?'쌀 2되':'옷감 1필'}</button>`:''}</article>`).join('')}</div><div class="chapter-chips"><button data-trade="sell" ${bag.beans<1?'disabled':''}>콩 1자루 팔기 · 동전 +2닢</button><button id="chapter-work-reset" class="quiet">거래 처음부터</button></div><p class="chapter-caption">가격과 수량은 모의 거래를 위한 게임 수치이며 실제 조선 시대 가격이 아니에요.</p>`;
   }
   if(step.kind==='research'){
    ready=answer.flat().every(n=>n!==null);
    html=`<div class="chapter-research-cases">${research456.issues.map((label,i)=>`<article>${picture('research8:'+(i+1),label)}<b>${esc(label)}</b></article>`).join('')}</div><div class="chapter-grid">${answer.map((row,i)=>`<article class="chapter-card"><b>연구 ${i+1}</b>${[['① 해결할 문제',research456.issues],['② 살펴볼 자료',research456.evidence],['③ 연구할 방법',research456.methods]].map(([label,options],j)=>`<label for="chapter-research-${i}-${j}">${label}</label><select id="chapter-research-${i}-${j}" data-research="${i}" data-column="${j}">${opts(options,row[j])}</select><p class="chapter-caption">${row[j]===null?'':esc(options[row[j]])}</p>`).join('')}</article>`).join('')}</div>`;
   }
   $('#chapter-workbench').innerHTML=html;$('#chapter-submit').disabled=!ready;
   bind('chapter-work-reset',()=>{$('#chapter-feedback').textContent='';reset();});
   dialog.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>{const n=Number(b.dataset.route),state=routeState456([...answer,n]);if(!state){$('#chapter-feedback').textContent=answer.length>=24?'24걸음 안에 도착할 수 있도록 처음부터 다시 계획해요.':'현재 위치와 맞닿은 길을 눌러요.';return;}answer.push(n);$('#chapter-feedback').textContent='';paint();});
   dialog.querySelectorAll('[data-stock]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.stock),delta=Number(b.dataset.delta);if((delta>0&&answer.reduce((a,b)=>a+b,0)>=step.total)||(delta<0&&answer[i]===0))return;answer[i]+=delta;$('#chapter-feedback').textContent='';paint();(dialog.querySelector(`[data-stock="${i}"][data-delta="${delta}"]:not(:disabled)`)||dialog.querySelector(`[data-stock="${i}"]:not(:disabled)`))?.focus();});
   dialog.querySelectorAll('[data-trade]').forEach(b=>b.onclick=()=>{const log=[...answer,b.dataset.trade];if(!tradeState456(log)){return;}prevBag=tradeState456(answer);answer=log;$('#chapter-feedback').textContent='';paint();});
   dialog.querySelectorAll('[data-research]').forEach(s=>s.onchange=()=>{answer[Number(s.dataset.research)][Number(s.dataset.column)]=s.value===''?null:Number(s.value);$('#chapter-feedback').textContent='';paint();$('#'+s.id)?.focus();});
  }
  paint();bind('chapter-submit',()=>{const b=$('#chapter-submit');if(submitted||b.disabled)return;submitted=true;submit(structuredClone(answer));if(b.isConnected)submitted=false;});
 }
 function renderStep(step,title,submit,progressText=''){
  if(step.kind==='naval'){
   show(header(title)+'<div id="naval-root"></div>');
   cleanup=mountNavalBattle({root:$('#naval-root'),onComplete:submit,onFailure:()=>{const r=progress.submit(current,'naval-attempt-'+Date.now()+'-'+(++navalAttempt));save();return r.charged;},isReduced});
   return;
  }
  if(['route','allocation','trade','research'].includes(step.kind))return renderWorkshop(step,title,submit);
  let selected=step.kind==='match'?Array(step.pairs.length).fill(null):step.kind==='sort'?Array(step.items.length).fill(null):step.kind==='trial'?[null,null]:['tools','letters','evidence'].includes(step.kind)?[]:null;
  let body='';const order=shuffled((step.options||[]).map((_,i)=>i)),mark='<span class="chapter-select-mark" aria-hidden="true">선택</span>';
  const instructions={choice:'알맞은 답 하나를 고르고 아래 확인 버튼을 눌러요.',evidence:`자료 ${step.need}개를 골라요. 고른 카드를 다시 누르면 뺄 수 있어요.`,tools:'도구 2개를 골라요. 고른 도구를 다시 누르면 뺄 수 있어요.',letters:'글자를 차례로 눌러요. 같은 글자는 여러 번 쓸 수 있어요.',match:'각 선택란을 열어 알맞은 설명을 연결한 뒤 확인해요.',sort:'각 기록이 어느 쪽에 해당하는지 선택란에서 골라요.',trial:'① 근거가 되는 법 조항을 고르고 ② 판정을 골라요.'};
  if(step.context)body+=`<details class="chapter-context"><summary>자료 펼쳐 보기 · ${esc(step.contextTitle||'함께 살펴볼 자료')}</summary><div class="chapter-grid">${step.context.map(x=>`<article class="chapter-card">${picture(x.art,x.name)}<b>${esc(x.name)}</b><p>${esc(x.text)}</p></article>`).join('')}</div></details>`;
  if(step.kind==='choice'){
   const refs=step.artPair?.length?step.artPair:step.art?[step.art]:[];
   const artHtml=refs.length?`<div class="chapter-question-art ${refs.length>1?'chapter-art-pair':''}">${refs.map((ref,i)=>`<figure>${picture(ref,step.artLabels?.[i])}${step.artLabels?.[i]?`<figcaption>${esc(step.artLabels[i])}</figcaption>`:''}</figure>`).join('')}</div>`:'';
   body+=`<div class="${refs.length?'chapter-choice-layout':''}">${artHtml}<div class="chapter-answers">${order.map(i=>`<button class="choice ${step.optionArt?.[i]?'chapter-option-picture':''}" data-choice="${i}" aria-pressed="false">${step.optionArt?.[i]?picture(step.optionArt[i]):''}<span>${esc(step.options[i])}</span></button>`).join('')}</div></div>`;
  }
  if(step.studyArt)body+=`<div class="chapter-study"><div id="chapter-study-picture">${picture(step.studyArt,'김홍도 벼타작')}</div><button id="chapter-zoom" class="quiet" aria-expanded="false">그림 크게 보기 ＋</button><p class="chapter-caption">${esc(step.credit)}</p></div>`;
  if(step.stage)body+=`<div class="chapter-stage">${picture('stage7','판소리 마당')}<div class="chapter-stage-actors">${[0,1,2].map(i=>`<img data-cast-image="${i}" src="${art['actor5:'+i].src}" alt="${step.cards[i].title}" class="chapter-stage-person">`).join('')}</div></div>`;
  if(step.newspaper)body+=`<section class="chapter-newspaper"><h3>우리 마을 기록신문</h3><p>서로 다른 분야의 기사 세 편을 아래에서 골라요.</p><div id="chapter-news-preview" class="chapter-grid" aria-live="polite"></div></section>`;
  if(step.kind==='evidence')body+=`<div class="chapter-grid chapter-evidence">${shuffled(step.cards.map((_,i)=>i)).map(i=>`<button class="chapter-card choice" data-pick="${i}" aria-pressed="false">${mark}${picture(step.pictures?.[i],step.cards[i].title)}<b>${esc(step.cards[i].title)}</b><p>${esc(step.cards[i].text)}</p></button>`).join('')}</div>`;
  if(step.kind==='tools')body+=`<div class="chapter-grid chapter-tools">${shuffled(tools.map((_,i)=>i)).map(i=>`<button class="chapter-card choice" data-tool="${tools[i][0]}" aria-pressed="false">${mark}${picture('instruments:'+i,tools[i][1])}<b>${tools[i][1]}</b><p>${tools[i][2]}</p></button>`).join('')}</div>`;
  if(step.kind==='letters')body+=`<div class="chapter-letter-layout">${picture(step.art)}<div><p>생활 속 낱말 <b>${step.word}</b>을 완성해요.</p><div class="chapter-letters" aria-label="선택한 글자" aria-live="polite"><span></span><span></span><span></span></div><div class="chapter-chips">${shuffled(['ㅁ','ㅜ','ㄹ','ㅂ','ㅏ','ㄴ']).map(l=>`<button data-letter="${l}">${l}</button>`).join('')}<button id="chapter-undo">하나 지우기</button></div></div></div>`;
  if(step.kind==='match'){
   const opts=shuffled(step.pairs.map((_,i)=>i));body+=`<div class="chapter-match-grid">${step.pairs.map((p,i)=>`<div class="chapter-row"><label class="${step.pictures?.[i]?'chapter-match-label':''}" for="chapter-match-${i}">${picture(step.pictures?.[i],p[0])}<span>${esc(p[0])}</span></label><div><select id="chapter-match-${i}" data-match="${i}"><option value="">연결할 기록을 골라요</option>${opts.map(k=>`<option value="${k}">${esc(step.pairs[k][1])}</option>`).join('')}</select><p class="chapter-caption" id="chapter-match-preview-${i}" aria-live="polite"></p></div></div>`).join('')}</div>`;
  }
  if(step.kind==='sort')body+=`<div class="chapter-grid chapter-comparison">${(step.pictures||['family5:0','family5:1']).map((ref,i)=>`<div>${picture(ref,step.groups[i])}<b>${esc(step.groups[i])}</b></div>`).join('')}</div><div class="chapter-match-grid">${shuffled(step.items.map((_,i)=>i)).map(i=>`<div class="chapter-row"><label for="chapter-sort-${i}">${esc(step.items[i][0])}</label><select id="chapter-sort-${i}" data-sort="${i}"><option value="">알맞은 쪽을 골라요</option>${step.groups.map((g,k)=>`<option value="${k}">${esc(g)}</option>`).join('')}</select></div>`).join('')}</div><p class="chapter-caption">${esc(step.note||'모든 가정이 동시에 똑같이 바뀐 것은 아니에요. 과거의 차별을 오늘의 기준으로 따르지 않아요.')}</p>`;
  if(step.kind==='trial')body+=`<div class="chapter-grid chapter-trial"><div>${picture(step.art)}<p class="chapter-caption">당시 법을 살펴보는 활동이에요. 오늘날의 법과 달라요.</p></div><div class="chapter-card"><b>① 『경국대전』에서 근거 조항 고르기</b>${shuffled(laws.map((_,i)=>i)).map(i=>`<button class="choice" data-law="${i}" aria-pressed="false">${esc(laws[i])}</button>`).join('')}</div></div><div class="chapter-chips" role="group" aria-label="② 판정 고르기"><button data-verdict="0" aria-pressed="false">조항에 맞아요</button><button data-verdict="1" aria-pressed="false">조항에 맞지 않아요</button></div>`;
  const weather=step.kind==='tools'?`<div class="chapter-weather">${picture(step.scene,art[step.scene].name)}<div><p class="chapter-progress">관측 의뢰 ${step.request+1} / 3</p><b>${esc(step.prompt)}</b><p>${esc(step.note)}</p></div></div>`:'';
  const needed=step.kind==='tools'?2:step.kind==='evidence'?step.need:step.kind==='letters'?3:step.kind==='match'?step.pairs.length:step.kind==='sort'?step.items.length:step.kind==='trial'?2:1;
  show(header(title)+`<p class="chapter-progress">${step.record?'마지막 기록 · 직접 완성하기':progressText||'자료를 살펴보고 직접 선택하기'}</p>${weather}<h3>${esc(step.kind==='tools'?'어떤 도구 두 개로 알아볼까요?':step.prompt)}</h3><div class="chapter-instruction"><span>${instructions[step.kind]}</span><span id="chapter-selection" role="status" aria-live="polite">0 / ${needed} 선택</span></div>${body}<div class="chapter-footer"><p id="chapter-feedback" role="status"></p><button id="chapter-submit" disabled>${step.record?'기록 확인하기':'선택한 내용 확인하기'}</button><p class="chapter-caption">고르는 동안에는 채점하지 않아요. 확인 버튼으로 답을 확정해요.</p></div>`);
  const ready=()=>{
   const count=Array.isArray(selected)?selected.filter(x=>x!==null).length:selected===null?0:1;
   $('#chapter-selection').textContent=`${count} / ${needed} 선택`;
   $('#chapter-submit').disabled=count!==needed;
  };
  function markButton(b,value){b.setAttribute('aria-pressed',String(value));b.classList.toggle('is-selected',value);const badge=b.querySelector('.chapter-select-mark');if(badge)badge.textContent=value?'✓ 선택됨':'선택';}
  function pressed(attr,value){dialog.querySelectorAll('['+attr+']').forEach(b=>markButton(b,b.getAttribute(attr)===String(value)));}
  function changed(){const f=$('#chapter-feedback');f.textContent='';ready();
   if(step.stage)dialog.querySelectorAll('[data-cast-image]').forEach(im=>im.classList.toggle('present',selected.includes(Number(im.dataset.castImage))));
   if(step.newspaper)$('#chapter-news-preview').innerHTML=selected.map(i=>`<article class="chapter-card">${picture(step.pictures[i])}<b>${esc(step.cards[i].title)}</b><p>${esc(step.cards[i].text)}</p></article>`).join('');
  }
  if(step.studyArt)bind('chapter-zoom',()=>{const b=$('#chapter-zoom'),large=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(large));b.textContent=large?'전체 보기 －':'그림 크게 보기 ＋';$('#chapter-study-picture').classList.toggle('is-large',large);});
  dialog.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{selected=Number(b.dataset.choice);pressed('data-choice',selected);changed();});
  for(const attr of ['pick','tool'])dialog.querySelectorAll('[data-'+attr+']').forEach(b=>b.onclick=()=>{
   const v=attr==='pick'?Number(b.dataset.pick):b.dataset.tool;
   if(selected.includes(v))selected=selected.filter(x=>x!==v);
   else if(selected.length<needed)selected.push(v);
   else{$('#chapter-feedback').textContent=`${needed}개를 이미 골랐어요. 선택한 ${attr==='tool'?'도구':'카드'}를 다시 눌러 빼고 바꿔 주세요.`;return;}
   dialog.querySelectorAll('[data-'+attr+']').forEach(x=>markButton(x,selected.includes(attr==='pick'?Number(x.dataset.pick):x.dataset.tool)));changed();
  });
  const updateLetters=()=>{$('.chapter-letters').classList.toggle('fx-word-done',selected.length===3);dialog.querySelectorAll('.chapter-letters span').forEach((s,i)=>s.textContent=selected[i]||'');changed();};
  dialog.querySelectorAll('[data-letter]').forEach(b=>b.onclick=()=>{if(selected.length<3)selected.push(b.dataset.letter);updateLetters();});bind('chapter-undo',()=>{selected.pop();updateLetters();});
  for(const attr of ['match','sort'])dialog.querySelectorAll('[data-'+attr+']').forEach(s=>s.onchange=()=>{selected[Number(s.dataset[attr])]=s.value===''?null:Number(s.value);s.classList.toggle('has-choice',s.value!=='');if(attr==='match')$('#chapter-match-preview-'+s.dataset.match).textContent=s.value===''?'':step.pairs[Number(s.value)][1];changed();});
  dialog.querySelectorAll('[data-law]').forEach(b=>b.onclick=()=>{selected[0]=Number(b.dataset.law);pressed('data-law',selected[0]);changed();});dialog.querySelectorAll('[data-verdict]').forEach(b=>b.onclick=()=>{selected[1]=Number(b.dataset.verdict);pressed('data-verdict',selected[1]);changed();});
  let submitted=false;bind('chapter-submit',()=>{const b=$('#chapter-submit');if(submitted||!b||b.disabled)return;submitted=true;const a=['tools','evidence'].includes(step.kind)?[...selected].sort():selected;submit(a);if(b.isConnected)submitted=false;});
 }
 function activity(i){const p=progress.state(),steps=lessonSteps(chapter,i),s=p.missions[i].answers.length;if(p.done.includes(i)){result(i);return;}if(s===steps.length){acknowledge(i);return;}const step=steps[s],render=()=>renderStep(step,c.missions[i].title,a=>{const result=progress.submit(i,a);save();feedback(i,step,result,()=>step.record?acknowledge(i):activity(i));});if(step.clip)film(step.clip,render);else if(c.missions[i].checkClip&&s===steps.length-2)film(c.missions[i].checkClip,render);else render();}
 function acknowledge(i){const m=c.missions[i];show(header('기록장에 담을 준비가 됐어요')+`<div class="chapter-record">${picture(m.art,m.title)}<p>${esc(m.recordActivities.at(-1).summary)}</p><button id="chapter-commit">마지막 기록 담고 미션 마치기 · +10점</button></div>`);bind('chapter-commit',()=>{const committed=progress.commit(i);let saved=true;if(committed){saved=save();onComplete(progress.state(),saved);}result(i,committed,saved);});}
 function result(i,committed=false,saved=true){const p=progress.state();show(header(c.missions[i].title)+`<div class="chapter-record"><img class="chapter-picture" src="assets/story/highfive.webp" alt="별하와 먹동이의 하이파이브"><p>${esc(c.missions[i].record)}</p><strong class="score ${committed?'fx-score-up':''}">집중 점수 ${p.score}점</strong>${committed?fxFloat('+10',true):''}<p>완성한 기록 ${p.done.length}/4 · 완료한 미션은 다시 보아도 점수가 바뀌지 않아요.</p>${saved?'':unsavedNote}<button id="chapter-next">${p.done.length===4?'여행의 기억 3문제로 →':'탐험으로 돌아가기'}</button></div>`);bind('chapter-next',p.done.length===4?review:close);}
 function finalRecord(){
  const p=progress.state(),news=lessonSteps(8,3)[0],chosen=p.missions[3].answers[0]||[];
  show(header('마지막 시대의 기록을 완성했어요')+`<div class="chapter-record"><img class="chapter-picture" src="assets/chapter-media/v3-ending.webp" alt="별하와 먹동이가 기록을 모아 돌아온 창작 장면"><span class="eyebrow">제8장 완성 기념 · ${esc(c.badge)}</span><h3>새로운 풍경, 이어지는 사람들의 하루</h3><p>새 문물은 이동과 소식 전달, 생활을 바꾸었어요. 그 속에는 옛 모습도 함께 남아 있었지요.</p><p>무엇이 달라졌고 사람들의 하루에 어떤 영향을 주었는지, 네가 고른 기록으로 이야기해 보세요.</p><strong class="score">제8장 집중 점수 ${p.score}점</strong><p>제8장 미션 4개 · 여행의 기억 3문제 완료</p></div><section class="chapter-newspaper"><h3>내가 완성한 우리 마을 기록신문</h3><div class="chapter-grid">${chosen.map(i=>`<article class="chapter-card">${picture(news.pictures[i])}<b>${esc(news.cards[i].title)}</b><p>${esc(news.cards[i].text)}</p></article>`).join('')}</div></section><p class="chapter-caption">이 화면은 제8장의 완성 기록이에요. 다른 장의 진행 상황은 메뉴의 장별 기록에서 확인할 수 있어요.</p><button id="chapter-finish">새빛 거리로 돌아가기</button>`);
  bind('chapter-finish',close);
 }
 function review(){if(progress.state().done.length!==4){notice('네 미션의 마지막 기록을 모두 완성하면 여행의 기억이 열려요.');return false;}const n=progress.state().reviewDone.length;if(n===3){if(chapter===8){finalRecord();return true;}show(header('여행의 기억 완성')+`<div class="chapter-record"><img class="chapter-picture" src="assets/story/highfive.webp" alt="별하와 먹동이가 함께 축하해요"><h3>${esc(c.title)}</h3><p>미션 4개와 여행의 기억 3문제를 모두 마쳤어요.</p><strong class="score">집중 점수 ${progress.state().score}점</strong><button id="chapter-finish">탐험으로 돌아가기</button></div>`);bind('chapter-finish',close);return true;}const step=choice(c.review[n]);renderStep(step,`여행의 기억 ${n+1}/3`,a=>{const r=progress.review(a);const saved=save();feedback(current,step,r,()=>{if(r.finished)onComplete(progress.state(),saved);review();});});return true;}
 return {open(i){if(!Number.isInteger(i)||i<0||i>3)return false;current=i;if(progress.state().done.includes(i))result(i);else intro(i);return true;},state:progress.state,review,allComplete:()=>progress.state().complete,reset(){close();progress.reset();save();},close};
}