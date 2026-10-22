// Effective production data + v2/v4/v5/v7/v8/v11/record patches, read-only source.
// Textbook: printed pp.91–92,95–99 (PDF pp.18–19,22–26). No textbook pages are published.
export const chapters456 = {
  "4": {
    "id": 3,
    "name": "전쟁 속에서 지켜야 할 것",
    "place": "바람 부는 수군 진영",
    "era": "임진왜란과 병자호란",
    "year": "1592년 → 1636·1637년",
    "art": "warcamp",
    "tone": "storm",
    "color": "#afc0cc",
    "companion": "해랑",
    "role": "피란길의 기록 도우미",
    "intro": "전쟁 소식이 도착했어. 지금 목표는 사람을 돕고, 어떤 일이 있었는지 정확히 남기는 거야.",
    "end": "승리의 노력과 전쟁으로 겪은 아픔을 함께 기록했어요.",
    "badge": "함께 지킨 기록",
    "review": [
      {
        "q": "임진왜란 때 조선에 힘을 보탠 세력을 바르게 묶은 것은?",
        "options": [
          "수군·청군·의병",
          "수군·의병·명군",
          "명군·일본군·의병",
          "수군·청군·일본군"
        ],
        "a": 1,
        "why": "수군과 각지의 의병이 활약했고, 명군도 조선을 도왔어요. 청의 침입으로 일어난 병자호란과 구분해요.",
        "art": "chapter4:0"
      },
      {
        "q": "식량과 무기를 갖추고 배를 정비한 뒤 군사를 훈련했어요. 이순신의 이러한 준비가 중요했던 까닭은?",
        "options": [
          "백성에게 전쟁 소식을 전하지 않고 군사만 움직이기 위해",
          "식량과 배의 수만으로 승패를 정하기 위해",
          "전투에서 버티고 싸울 힘을 미리 갖추기 위해",
          "다른 지역의 군사나 백성의 도움을 받지 않기 위해"
        ],
        "a": 2,
        "why": "식량·무기·배·훈련은 실제 전투를 지속하고 대응할 힘이 되었어요.",
        "art": "chapter4:3"
      },
      {
        "q": "남한산성에서 추위와 식량 부족을 겪던 조선은 병자호란을 어떻게 마무리했나요?",
        "options": [
          "남한산성을 끝까지 지켜 청군을 물리쳤어요.",
          "명에 항복하고 남한산성에서 물러나왔어요.",
          "일본과 강화도 조약을 맺어 전쟁을 끝냈어요.",
          "어려움을 견디지 못하고 결국 청에 항복했어요."
        ],
        "a": 3,
        "why": "병자호란 때 계속 싸우자는 의견과 화친하자는 의견이 있었지만, 실제 결과는 청에 대한 항복이었어요.",
        "art": "winter7"
      }
    ],
    "missions": [
      {
        "id": 12,
        "ch": 3,
        "title": "마을에 전해진 전쟁 소식",
        "type": "route",
        "goal": "마을 두 곳에 소식을 전하고 24걸음 안에 안전한 곳으로 가요.",
        "record": "임진왜란 초기 조선은 큰 어려움을 겪었으며 전쟁은 사람들의 생활을 무너뜨렸다.",
        "check": {
          "q": "이 미션에서 먼저 사람들에게 전쟁 소식을 전한 까닭은?",
          "options": [
            "전쟁이 주민의 안전과 생활에 영향을 주기 때문",
            "소식을 알리는 것만으로 피란 준비가 끝나기 때문",
            "이미 전쟁이 끝나 승리를 알릴 때였기 때문",
            "전쟁 기록에는 군인의 싸움만 남기면 되기 때문"
          ],
          "a": 0,
          "why": "전쟁의 과정과 함께 백성이 겪은 어려움도 기록해요."
        },
        "hint": "출발점 가까운 마을부터 들르면 돌아가는 길을 줄일 수 있어요. 25번째 걸음은 실패예요.",
        "art": "chapter4:0",
        "learnTitle": "전쟁은 마을의 삶도 바꿨어요",
        "recordActivities": [
          {
            "type": "blank",
            "art": "chapter4:0",
            "before": "전쟁 소식을 주민에게 먼저 알린 까닭은 ",
            "after": " 위해서예요.",
            "options": [
              "주민의 안전과 생활을 지키기",
              "소식만으로 피란 준비를 끝내기",
              "전쟁이 끝난 것을 축하하기"
            ],
            "answer": 0,
            "summary": "임진왜란은 백성의 안전과 생활에도 큰 어려움을 가져왔어요.",
            "prompt": "알맞은 말 조각을 골라 기록을 완성해요."
          }
        ]
      },
      {
        "id": 13,
        "ch": 3,
        "title": "수군의 준비",
        "type": "battle",
        "goal": "식량·무기·배를 준비한 뒤, 거북선과 판옥선이 협력해 바닷길을 지켜요.",
        "record": "이순신은 배와 식량·무기 등을 준비했고 수군은 임진왜란에서 활약했다.",
        "check": {
          "q": "수군의 활약을 설명할 때 함께 살펴야 할 것은?",
          "options": [
            "식량·무기·배의 준비와 수군의 협력",
            "배의 크기만 비교하고 준비 과정은 빼기",
            "지휘관의 용기만 살피고 군사들의 노력은 빼기",
            "승리한 날짜만 외우고 바닷길의 특징은 빼기"
          ],
          "a": 0,
          "why": "준비와 협력이 위기에 대응하는 바탕이 되었어요."
        },
        "hint": "다가오는 적선을 눌러 조준해요. 금빛 협공 구역에서는 더 빠르게 연속 공격할 수 있어요. 배의 수와 배치는 훈련 게임의 모형이에요.",
        "art": "chapter4:3",
        "learnTitle": "준비와 협력이 만든 힘",
        "recordActivities": [
          {
            "type": "link",
            "pairs": [
              {
                "art": "chapter4:1",
                "label": "식량을 옮기는 수군",
                "text": "군사들이 먹을 식량을 마련해요."
              },
              {
                "art": "chapter4:3",
                "label": "배를 고치는 수군",
                "text": "배의 상태를 살피고 정비해요."
              }
            ],
            "summary": "이순신과 수군의 활약에는 식량·무기·배의 준비와 협력이 바탕이 되었어요.",
            "prompt": "각 그림 아래에서 알맞은 설명을 골라 연결해요."
          }
        ],
        "introClip": "naval"
      },
      {
        "id": 14,
        "ch": 3,
        "title": "함께 지킨 사람들",
        "type": "evidence",
        "goal": "임진왜란을 이겨 내는 데 힘을 보탠 노력 3개를 모두 골라요.",
        "record": "수군·의병의 활약과 명군의 도움이 있었으며 전쟁으로 많은 사람이 피해를 겪었다.",
        "check": {
          "q": "전쟁 기록에 승리와 피해를 함께 남기는 까닭은?",
          "options": [
            "전쟁이 사람들의 삶에 미친 영향을 함께 이해하려고",
            "승리한 장수의 공로로 백성의 경험을 대신하려고",
            "피해를 입은 사람의 수만으로 어느 쪽이 이겼는지 결정하려고",
            "지역마다 달랐던 전쟁의 경험을 모두 같았다고 정리하려고"
          ],
          "a": 0,
          "why": "파괴된 마을, 목숨을 잃거나 포로가 된 사람들의 이야기도 중요해요."
        },
        "need": 3,
        "cards": [
          {
            "title": "수군의 기록",
            "text": "바다에서 이순신과 수군이 활약했어요.",
            "tag": "yes"
          },
          {
            "title": "의병의 기록",
            "text": "백성이 스스로 나서 의병을 조직하고 싸웠어요.",
            "tag": "yes"
          },
          {
            "title": "명군의 기록",
            "text": "명에서 온 군대의 도움도 있었어요.",
            "tag": "yes"
          },
          {
            "title": "백성의 생활에 대한 기록",
            "text": "전쟁 동안 백성의 생활에는 아무 변화도 없었어요.",
            "tag": "no"
          }
        ],
        "extraNote": "마을과 농토가 파괴되고, 목숨을 잃거나 포로로 끌려간 사람들도 있었어요.",
        "hint": "한 사람만의 승리가 아니었어요. 여러 사람의 노력을 찾아요.",
        "art": "chapter4:4",
        "learnTitle": "함께 싸우고, 함께 겪은 전쟁",
        "cardArt": [
          "chapter4:3",
          "chapter4:4",
          "ming7",
          "chapter4:0"
        ],
        "recordActivities": [
          {
            "type": "compare",
            "panels": [
              {
                "art": "chapter4:4",
                "label": "나라를 지킨 사람들",
                "note": ""
              },
              {
                "art": "chapter4:0",
                "label": "전쟁을 겪은 마을",
                "note": ""
              }
            ],
            "prompt": "두 장면을 모두 기록해야 하는 까닭은?",
            "options": [
              "승리한 장수의 공로가 백성의 경험을 대신하기 때문이에요.",
              "전쟁이 사람들의 삶에 미친 영향을 함께 이해하기 위해서예요.",
              "피해를 입은 사람의 수만으로 승패를 정하기 위해서예요."
            ],
            "answer": 1,
            "summary": "전쟁을 이해하려면 나라를 지킨 노력과 백성이 겪은 피해를 함께 살펴야 해요."
          }
        ]
      },
      {
        "id": 15,
        "ch": 3,
        "title": "남한산성의 겨울",
        "type": "winter",
        "goal": "추위와 굶주림에 대비해 물자를 나누고, 갑작스러운 한파도 버텨요.",
        "record": "남한산성에서 항전과 화친의 주장이 맞섰지만, 어려움 속에서 인조는 청에 항복했다.",
        "check": {
          "q": "병자호란 때 남한산성에서 버티던 조선은 결국 어떻게 되었나요?",
          "options": [
            "남한산성을 끝까지 지켜 청군을 물리치고 승리했어요",
            "추위와 굶주림 등 어려움 속에서 결국 청에 항복했어요",
            "명의 도움으로 청군을 몰아내고 전쟁을 끝냈어요",
            "청의 요구를 받아들이지 않은 채 화친을 맺었어요"
          ],
          "a": 1,
          "why": "신하들은 계속 싸우자는 의견과 화친하자는 의견으로 나뉘었어요. 실제 역사에서는 어려움을 견디지 못하고 결국 청에 항복했어요."
        },
        "hint": "화면에 표시된 식량·땔감·돌봄의 최소 수량을 채워요. 물자 배분 실험에는 감점이 없어요.",
        "art": "chapter4:5",
        "learnTitle": "두 주장과 실제 역사의 결과",
        "recordActivities": [
          {
            "type": "blank",
            "art": "winter7",
            "before": "병자호란 때 남한산성에서 버티던 조선은 어려움 속에서 결국 ",
            "after": "",
            "options": [
              "명군과 함께 청군을 몰아냈어요.",
              "끝까지 싸워 청군을 물리쳤어요.",
              "청에 항복했어요."
            ],
            "answer": 2,
            "summary": "항전과 화친의 주장이 맞섰지만, 추위와 굶주림 속에서 인조는 결국 청에 항복했어요.",
            "prompt": "알맞은 말 조각을 골라 기록을 완성해요."
          }
        ],
        "introClip": "winter"
      }
    ],
    "title": "전쟁 속에서 지켜야 할 것"
  },
  "5": {
    "id": 4,
    "name": "다시 움직이는 마을",
    "place": "초여름 들판과 장시",
    "era": "조선 후기의 경제와 신분",
    "year": "조선 후기",
    "art": "farm",
    "tone": "summer",
    "color": "#d6b46e",
    "companion": "만금",
    "role": "장시의 보부상",
    "intro": "농사짓는 방법도, 물건을 구하는 방법도 달라졌어. 네 손으로 마을의 약속을 이어 줘.",
    "end": "들판과 장터가 다시 활기를 되찾았어요.",
    "badge": "변화의 기록",
    "review": [
      {
        "q": "모내기가 널리 퍼지면서 나타난 변화는?",
        "options": [
          "생산량이 늘고 김매기 노동을 줄일 수 있었다.",
          "김매기는 줄었지만 벼농사를 할 수 없게 되었다.",
          "생산량은 늘었지만 모든 농민의 재산은 같아졌다.",
          "벼를 옮겨 심는 대신 밭작물만 재배하게 되었다."
        ],
        "a": 0,
        "why": "모내기는 생산량을 늘리고 김매기 노동을 줄이는 데 도움이 되었어요. 모든 농민이 똑같이 부유해진 것은 아니에요.",
        "art": "chapter5:0"
      },
      {
        "q": "쌀을 팔아 천을 사고 싶은데, 천 장수는 쌀이 필요 없대요. 동전을 쓰면 어떻게 해결할 수 있을까요?",
        "options": [
          "쌀과 천의 값을 동전으로 적고 천 장수에게 쌀을 받으라고 한다.",
          "동전을 갖고 천 장수가 쌀을 원할 때까지 기다린다.",
          "쌀을 다른 사람에게 팔고 받은 동전으로 천을 산다.",
          "쌀을 천 장수에게 맡기고 값을 냈다고 생각한다."
        ],
        "a": 2,
        "why": "물건을 팔아 얻은 동전으로 다른 물건을 살 수 있어요. 서로 원하는 물건을 직접 맞출 필요가 줄어들어요.",
        "art": "chapter5:4"
      },
      {
        "q": "조선 후기에 재산을 모아 양반 신분을 얻은 사람이 나타났어요. 이 사실로 알 수 있는 것은?",
        "options": [
          "재산과 관계없이 신분은 바뀌지 않았다.",
          "기존 신분 질서가 흔들리고 있었다.",
          "신분에 따른 차별이 이미 모두 사라졌다.",
          "모든 농민이 양반이 되어 농사를 그만두었다."
        ],
        "a": 1,
        "why": "경제적 변화 속에서 신분 질서가 흔들렸지만, 신분제와 차별이 즉시 사라진 것은 아니에요.",
        "art": "register:2"
      }
    ],
    "missions": [
      {
        "id": 16,
        "ch": 4,
        "title": "논의 일손을 나누자",
        "type": "farm",
        "goal": "계절에 맞게 농사 일을 놓고 논의 변화를 살펴요.",
        "record": "모내기가 널리 퍼지며 생산량이 늘고 김매기 노동을 줄일 수 있었으며 이모작도 쉬워졌다.",
        "check": {
          "q": "모내기법이 널리 퍼지면서 농사에 어떤 도움이 되었나요?",
          "options": [
            "김매기가 쉬워져 적은 일손으로 넓은 땅을 농사지을 수 있었어요.",
            "모내기한 논에는 잡초가 자라지 않아 김매기를 할 필요가 없어졌어요.",
            "벼를 거둔 논에 보리를 기를 수 없어 벼농사만 지어야 했어요.",
            "모를 옮겨 심은 뒤에는 물을 댈 필요가 없어 가뭄의 영향을 받지 않았어요."
          ],
          "a": 0,
          "why": "모를 줄맞추어 심으면 잡초를 뽑기 쉬워 일손을 줄일 수 있었어요. 쌀 생산량이 늘었고, 벼를 거둔 논에서 보리를 기르는 이모작도 이루어졌어요."
        },
        "hint": "봄에는 모를 옮겨 심고, 여름에는 김을 매고, 가을에는 벼를 거두어요.",
        "art": "chapter5:0",
        "learnTitle": "모내기가 널리 퍼지다",
        "recordActivities": [
          {
            "type": "compare",
            "panels": [
              {
                "art": "chapter5:0",
                "label": "모내기하는 논",
                "note": ""
              },
              {
                "art": "seasons:1",
                "label": "여름의 농사",
                "note": ""
              }
            ],
            "prompt": "모내기법이 퍼지면서 생긴 장점을 기록해요.",
            "options": [
              "김매기가 쉬워져 적은 일손으로 넓은 땅을 농사지을 수 있었어요.",
              "잡초가 자라지 않아 김매기를 하지 않아도 되었어요.",
              "물을 대지 않아도 되어 가뭄의 영향을 받지 않았어요."
            ],
            "answer": 0,
            "summary": "모내기법은 김매기 일손을 줄이고 생산량을 늘리는 데 도움이 되었어요."
          }
        ]
      },
      {
        "id": 17,
        "ch": 4,
        "title": "우리 집의 작물 계획",
        "type": "crop-orders",
        "goal": "먹을거리와 판매용 작물을 그림 주문서에 맞게 바구니에 담아요.",
        "record": "조선 후기에는 다양한 작물이 재배되었고 먹을거리와 판매할 작물도 늘었다.",
        "check": {
          "q": "감자와 고구마가 조선 후기 백성의 생활에 도움을 준 까닭은?",
          "options": [
            "물을 넉넉히 댈 수 있는 논에서만 자라 벼를 대신했기 때문이에요.",
            "기르기 쉽고 척박한 땅에서도 잘 자라 먹을거리를 보탰기 때문이에요.",
            "먹을거리보다 옷감 재료로 팔아 백성의 수입을 늘렸기 때문이에요.",
            "벼와 보리를 모두 대신해 흉년의 먹을거리 부족을 없앴기 때문이에요."
          ],
          "a": 1,
          "why": "감자와 고구마는 먹을거리를 늘려 굶주림을 해결하는 데 도움이 되었어요. 고추·인삼·담배 등을 길러 시장에 팔아 이익을 얻는 사람들도 나타났어요.",
          "artPair": [
            "supplies:0",
            "supplies:1"
          ]
        },
        "hint": "감자·고구마는 먹을거리 주문에, 고추·인삼은 판매 주문에 담아 봐요. 인삼은 새로 들어온 외래 작물로 묶지 않아요.",
        "art": "supplies:0",
        "learnTitle": "작물의 쓰임을 생각해요",
        "recordActivities": [
          {
            "type": "compare",
            "panels": [
              {
                "art": "supplies:0",
                "label": "감자",
                "note": ""
              },
              {
                "art": "supplies:1",
                "label": "고구마",
                "note": ""
              }
            ],
            "prompt": "두 작물이 백성의 생활에 준 도움을 골라요.",
            "options": [
              "벼와 보리를 모두 대신하여 흉년이 없어졌어요.",
              "척박한 땅에서도 잘 자라 먹을거리를 보탰어요.",
              "먹는 대신 옷감 재료로 팔아 수입을 늘렸어요."
            ],
            "answer": 1,
            "summary": "감자와 고구마는 척박한 땅에서도 잘 자라 백성의 먹을거리를 늘리는 데 도움이 되었어요."
          }
        ]
      },
      {
        "id": 18,
        "ch": 4,
        "title": "장시의 약속을 지켜라",
        "type": "trade",
        "goal": "쌀 2되·옷감 1필·약초 1묶음을 구해요.",
        "record": "장시와 보부상의 활동이 활발해지고 상평통보 같은 화폐가 널리 쓰였다.",
        "check": {
          "q": "물물교환과 비교한 동전의 편리함은?",
          "options": [
            "서로 원하는 물건을 직접 맞추지 않아도 거래할 수 있다",
            "동전을 쓰면 장시마다 다른 물건값을 같게 만들 수 있다",
            "서로 원하는 물건이 같아야 동전으로 거래할 수 있다",
            "동전을 쓰는 장시에서는 보부상이 먼 고을로 다닐 필요가 없다"
          ],
          "a": 0,
          "why": "물건을 팔아 받은 동전으로 다른 물건을 살 수 있어요."
        },
        "hint": "콩을 팔아 동전을 얻거나, 콩을 쌀·옷감과 바꿔도 돼요. 가격은 게임용 수치예요.",
        "art": "chapter5:4",
        "learnTitle": "동전으로 이어지는 거래",
        "recordActivities": [
          {
            "type": "blank",
            "art": "chapter5:4",
            "before": "물건을 팔아 받은 동전으로 ",
            "after": "",
            "options": [
              "물건값을 모두 같게 만들 수 있어요.",
              "서로 원하는 물건이 같을 때만 살 수 있어요.",
              "내게 필요한 다른 물건을 살 수 있어요."
            ],
            "answer": 2,
            "summary": "동전이 쓰이면서 서로 원하는 물건을 직접 맞추지 않아도 거래하기 편리해졌어요.",
            "prompt": "알맞은 말 조각을 골라 기록을 완성해요."
          }
        ]
      },
      {
        "id": 19,
        "ch": 4,
        "title": "달라진 마을 명부",
        "type": "evidence",
        "goal": "신분 질서가 흔들린 흔적 3개를 찾아요.",
        "record": "재산을 모아 양반 신분을 얻는 사람들이 나타나면서 조선 후기의 신분 질서가 흔들렸다.",
        "check": {
          "q": "신분 질서의 동요를 과장하지 않은 설명은?",
          "options": [
            "돈으로 양반이 된 사람이 늘면서 모든 신분의 의무도 같아졌다",
            "변화가 있었지만 신분 차별이 즉시 사라진 것은 아니다",
            "재산을 모아도 태어날 때의 신분은 바뀌지 않았다",
            "일부 사람의 신분이 달라져 모든 백성의 재산까지 같아졌다"
          ],
          "a": 1,
          "why": "변화가 있었다는 사실과 그 변화의 범위를 함께 생각해요."
        },
        "need": 3,
        "cards": [
          {
            "title": "상인의 선택",
            "text": "재산을 모은 상인이 양반 신분을 사려고 해요.",
            "tag": "yes"
          },
          {
            "title": "달라진 명부",
            "text": "양반이 늘고 상민과 천민이 줄어드는 변화가 나타났어요.",
            "tag": "yes"
          },
          {
            "title": "차별도 모두 사라졌을까?",
            "text": "이제 모든 사람이 완전히 같은 권리를 누렸어요.",
            "tag": "no"
          },
          {
            "title": "달라진 신분 질서",
            "text": "예전처럼 신분 질서가 그대로 유지되지 않았어요.",
            "tag": "yes"
          }
        ],
        "hint": "신분이 흔들렸다는 것과 완전히 없어졌다는 것은 달라요.",
        "art": "chapter5:5",
        "learnTitle": "흔들리기 시작한 신분 질서",
        "cardArt": [
          "register:2",
          "register:3",
          "register:0",
          "register:1"
        ],
        "cardTitles": [
          "상인의 선택",
          "달라진 명부",
          "차별도 모두 사라졌을까?",
          "달라진 신분 질서"
        ],
        "cardArtRequired": [
          "chapter5:5",
          "chapter5:4",
          "register:0",
          "register:1"
        ],
        "recordActivities": [
          {
            "type": "compare",
            "panels": [
              {
                "art": "register:2",
                "label": "재산을 모아 달라진 신분",
                "note": ""
              },
              {
                "art": "register:3",
                "label": "남아 있는 신분 차이",
                "note": ""
              }
            ],
            "prompt": "두 기록을 모두 생각한 설명을 골라요.",
            "options": [
              "신분 질서는 흔들렸지만 차별이 곧바로 모두 사라지지는 않았어요.",
              "양반이 된 사람이 늘면서 모든 사람의 의무도 같아졌어요.",
              "일부 사람의 신분이 바뀌면서 모든 백성의 재산도 같아졌어요."
            ],
            "answer": 0,
            "summary": "조선 후기 신분 질서에 변화가 생겼지만 신분 차별이 곧바로 사라진 것은 아니에요."
          }
        ]
      }
    ],
    "title": "다시 움직이는 마을"
  },
  "6": {
    "id": 5,
    "name": "세상을 다르게 바라보다",
    "place": "비 갠 학자의 마을",
    "era": "새 문물·실학·새로운 가르침",
    "year": "조선 후기, 서로 다른 시기의 변화",
    "art": "village",
    "tone": "dusk",
    "color": "#b4a7c9",
    "companion": "서율",
    "role": "자료를 비교하는 견습 학자",
    "intro": "낯선 물건과 생각이 들어왔어. 한쪽 말만 듣지 말고 자료를 나란히 놓아 보자.",
    "end": "서로 다른 생각을 근거와 함께 기록했어요.",
    "badge": "생각의 기록",
    "review": [
      {
        "q": "실학자들이 관심을 기울인 연구 주제로 알맞은 것은?",
        "options": [
          "제사에서 옷을 입는 순서만 연구하기",
          "백성의 생활과 관계없이 글의 형식만 따지기",
          "관찰한 결과보다 예전의 설명만 따르기",
          "농사법과 상업을 연구해 생활을 개선하기"
        ],
        "a": 3,
        "why": "실학자들은 농업·상공업 등 현실의 문제를 연구해 백성의 생활을 낫게 하려 했어요.",
        "art": "chapter6:0"
      },
      {
        "q": "중국에 다녀온 사신이 서양의 시계와 세계 지도를 소개했어요. 어떤 사실을 알 수 있을까요?",
        "options": [
          "모든 서양 문물은 조선에서 처음 만들어졌어요.",
          "중국과의 교류를 통해 서양 문물도 전해졌어요.",
          "서양 문물은 농사 경험을 모은 책으로만 전해졌어요.",
          "새 문물은 조선의 생활에 이용될 수 없었어요."
        ],
        "a": 1,
        "why": "중국을 오가던 사신 등을 통해 시계·망원경·세계 지도와 서적이 조선에 전해졌어요.",
        "art": "chapter6:1"
      },
      {
        "q": "천주교와 동학을 비교한 설명으로 알맞은 것은?",
        "options": [
          "둘 다 평등을 이야기했지만 생겨난 배경과 특징은 달랐다.",
          "둘 다 평등을 이야기했으므로 이름만 다른 같은 가르침이다.",
          "천주교는 조선에서, 동학은 서양에서 생겨났다.",
          "둘은 배경이 다르므로 사람을 평등하게 보는 생각도 없었다."
        ],
        "a": 0,
        "why": "평등의 생각이라는 공통점이 있지만 배경과 특징은 달라요. 동학에는 서학에 맞서는 성격도 있었어요.",
        "art": "chapter6:5"
      }
    ],
    "missions": [
      {
        "id": 20,
        "ch": 5,
        "title": "사신의 가방",
        "type": "match",
        "goal": "중국에 다녀온 사신이 들여온 서양 문물과 책을 살펴, 쓰임을 연결해요.",
        "record": "중국을 통해 서양의 문물과 책이 전해지며 세상을 바라보는 생각에도 변화가 나타났다.",
        "check": {
          "q": "새 문물이 사람들의 생활에 준 영향을 알아보려 해요. 어떤 질문이 알맞을까요?",
          "options": [
            "새 물건을 쓰면서 사람들의 생활은 어떻게 달라졌을까?",
            "그림 속 물건 이름은 모두 몇 글자로 이루어졌을까?",
            "네 물건을 이름의 가나다순으로 놓으면 무엇이 맨 앞일까?",
            "그림 속 물건 중에서 가장 진한 색으로 칠한 것은 무엇일까?"
          ],
          "a": 0,
          "why": "영향을 알아보려면 새 문물을 쓰기 전과 후의 생활을 비교해요. 이름의 글자 수나 그림의 색만 세어서는 생활의 변화를 알기 어려워요."
        },
        "pairs": [
          [
            "먼 곳을 더 자세히 살펴봄",
            "천리경(망원경)"
          ],
          [
            "시각을 알아보는 새 도구",
            "서양 시계"
          ],
          [
            "세계의 모습에 대한 인식이 달라짐",
            "세계 지도"
          ],
          [
            "서양의 과학 기술과 천주교의 생각을 접함",
            "중국을 거쳐 온 서양 과학·천주교 서적"
          ]
        ],
        "hint": "각 물건의 쓰임이 사람들의 인식에 어떤 영향을 주었는지 생각해요.",
        "art": "chapter6:0",
        "learnTitle": "새 문물과 만나다",
        "pairArt": [
          "western:1",
          "western:0",
          "western:2",
          "western:3"
        ],
        "recordActivities": [
          {
            "type": "link",
            "pairs": [
              {
                "art": "western:1",
                "label": "천리경(망원경)",
                "text": "먼 곳을 더 자세히 살펴볼 수 있어요."
              },
              {
                "art": "western:2",
                "label": "세계 지도",
                "text": "세계를 바라보는 생각이 달라질 수 있어요."
              }
            ],
            "summary": "새 문물의 영향을 알아보려면 사람들이 무엇을 할 수 있게 되었는지 살펴보아요.",
            "prompt": "각 그림 아래에서 알맞은 설명을 골라 연결해요."
          }
        ]
      },
      {
        "id": 21,
        "ch": 5,
        "title": "마을의 문제를 연구하라",
        "type": "proposal",
        "goal": "서로 다른 마을 문제 2개를 골라, 자료와 해결 방법을 연결해요.",
        "record": "실학자들은 현실의 문제를 해결하기 위해 농업·상공업·우리 역사와 지리 등을 연구했다.",
        "check": {
          "q": "서로 다른 두 가지 마을 문제를 연구했어요. 두 연구가 모두 실학의 방향에 어울리는 까닭은?",
          "options": [
            "마을의 조건이 달라도 같은 방법만 쓰려 하기 때문이에요.",
            "백성의 실제 어려움을 자료로 살펴 해결하려 하기 때문이에요.",
            "농사와 장사를 구별 없이 같은 문제로 봤기 때문이에요.",
            "주민의 경험을 살피기보다 예전의 방법만 따랐기 때문이에요."
          ],
          "a": 1,
          "why": "실학자들은 농업·상공업·우리 역사와 지리 등 다양한 분야를 연구하여 현실의 문제를 해결하려 했어요."
        },
        "hint": "고른 문제에 맞는 자료와 방법을 하나씩 연결해요.",
        "art": "research5",
        "learnTitle": "자료를 살펴 생활의 문제를 연구해요.",
        "recordActivities": [
          {
            "type": "blank",
            "art": "research8:0",
            "before": "실학자들은 자료를 살펴 ",
            "after": " 연구했어요.",
            "options": [
              "옛 방법을 모두 똑같이 따르려고",
              "백성의 실제 어려움을 해결하려고",
              "농사와 장사의 차이를 없애려고"
            ],
            "answer": 1,
            "summary": "실학자들은 백성의 실제 어려움을 해결하려고 농업·상공업·역사와 지리 등을 연구했어요.",
            "prompt": "알맞은 말 조각을 골라 기록을 완성해요."
          }
        ]
      },
      {
        "id": 22,
        "ch": 5,
        "title": "새로운 가르침을 둘러싼 목소리",
        "type": "sort",
        "goal": "천주교를 믿은 사람들의 생각과 나라를 다스리던 사람들의 걱정을 나누어요.",
        "record": "천주교의 평등한 생각이 퍼졌지만 유교 질서와 충돌하여 탄압을 받기도 했다.",
        "check": {
          "q": "당시의 서로 다른 목소리를 살피는 까닭은?",
          "options": [
            "각자의 생각과 갈등의 배경을 이해하려고",
            "후대의 기준만으로 당시 의견의 이유를 정하려고",
            "한쪽 기록만으로 모든 사람의 생각을 판단하려고",
            "평등을 말한 가르침은 모두 같다고 묶으려고"
          ],
          "a": 0,
          "why": "천주교를 받아들인 이유와 지배층이 유교 질서를 지키려 한 이유를 자료에서 살펴요."
        },
        "groups": [
          "천주교를 믿은 사람들",
          "나라를 다스리던 사람들"
        ],
        "items": [
          [
            "신분과 관계없이 사람은 평등하다고 여김",
            0
          ],
          [
            "새로운 믿음에 관심을 가짐",
            0
          ],
          [
            "일부 신자의 제사 거부를 유교 질서에 대한 위협으로 봄",
            1
          ],
          [
            "기존 사회 질서가 흔들릴까 염려함",
            1
          ]
        ],
        "hint": "믿음을 받아들인 이유와 기존 질서를 지키려 한 이유를 구분해요.",
        "art": "chapter6:5",
        "learnTitle": "서로 다른 생각을 이해해요",
        "recordActivities": [
          {
            "type": "compare",
            "panels": [
              {
                "art": "chapter6:2",
                "label": "천주교를 믿은 사람들",
                "note": ""
              },
              {
                "art": "chapter6:5",
                "label": "유교 질서를 지키려는 지배층",
                "note": ""
              }
            ],
            "prompt": "서로 다른 목소리를 함께 살피는 이유를 기록해요.",
            "options": [
              "나중 시대의 기준만으로 당시 사람들의 이유를 정해요.",
              "한쪽 기록으로 모든 사람의 생각을 판단해요.",
              "각자의 생각과 갈등이 생긴 배경을 이해해요."
            ],
            "answer": 2,
            "summary": "천주교를 받아들인 이유와 유교 질서를 지키려 한 이유를 함께 살피면 갈등의 배경을 이해할 수 있어요."
          }
        ]
      },
      {
        "id": 23,
        "ch": 5,
        "title": "사람들이 바라던 세상",
        "type": "evidence",
        "goal": "동학과 천주교를 비교한 바른 자료 3개를 골라요.",
        "record": "동학은 평등과 사회 변화의 바람을 담았으며, 천주교와 공통점도 차이점도 있었다.",
        "check": {
          "q": "동학과 천주교를 비교할 때 알맞은 설명은?",
          "options": [
            "평등을 가르쳤으므로 생겨난 배경도 같은 종교이다",
            "평등의 생각은 공통되지만 배경과 특징은 다르다",
            "이름이 다르므로 공통된 생각을 찾을 수 없다",
            "둘 다 신분에 따라 사람을 다르게 대하도록 가르쳤다"
          ],
          "a": 1,
          "why": "동학과 천주교에는 평등의 생각이 나타났어요. 동학은 서학에 맞서 우리 것을 지키려는 뜻을 담았으며, 새로운 세상이 열릴 것이라고 가르쳤어요."
        },
        "need": 3,
        "cards": [
          {
            "title": "두 가르침이 바란 세상",
            "text": "신분과 관계없이 사람을 평등하게 바라보는 생각이 나타났어요.",
            "tag": "yes"
          },
          {
            "title": "동학이 생겨난 배경",
            "text": "동학이라는 이름에는 서학에 맞서 우리 것을 지키려는 뜻이 담겼어요.",
            "tag": "yes"
          },
          {
            "title": "둘은 완전히 같았을까?",
            "text": "동학과 천주교는 같은 이름의 한 모임이에요.",
            "tag": "no"
          },
          {
            "title": "사람들의 바람",
            "text": "동학에는 새로운 세상과 사회 변화를 바라는 생각이 담겼어요.",
            "tag": "yes"
          }
        ],
        "hint": "평등이라는 공통점과 서로 다른 배경을 함께 생각해요. 천주교의 목소리 기록을 먼저 살펴보면 비교에 도움이 돼요. 서학은 서양 학문을 가리켰고 당시 천주교를 가리키는 말로도 쓰였어요.",
        "art": "chapter6:3",
        "learnTitle": "같은 점과 다른 점",
        "cardArt": [
          "chapter6:3",
          "chapter6:2",
          "chapter6:5",
          "chapter6:4"
        ],
        "recordActivities": [
          {
            "type": "compare",
            "panels": [
              {
                "art": "chapter6:3",
                "label": "동학",
                "note": ""
              },
              {
                "art": "chapter6:2",
                "label": "천주교",
                "note": ""
              }
            ],
            "prompt": "두 가르침의 공통점과 차이점을 함께 기록해요.",
            "options": [
              "평등의 생각은 공통되지만 생겨난 배경과 특징은 달라요.",
              "평등을 가르쳤으므로 생겨난 배경과 특징도 같아요.",
              "이름이 다르므로 공통되는 생각은 찾을 수 없어요."
            ],
            "answer": 0,
            "summary": "동학과 천주교에는 평등의 생각이 나타났지만 생겨난 배경과 특징에는 차이가 있었어요."
          }
        ]
      }
    ],
    "title": "세상을 다르게 바라보다"
  }
};
export const art456 = {"chapter3:3": {"src": "assets/chapter-media/v2-chapter3.webp", "size": [1536, 1024], "rect": [0.0, 512.0, 512.0, 512.0]}, "chapter4:0": {"src": "assets/chapter-media/v2-chapter4.webp", "size": [1536, 1024], "rect": [0.0, 0.0, 512.0, 512.0]}, "chapter4:1": {"src": "assets/chapter-media/v2-chapter4.webp", "size": [1536, 1024], "rect": [512.0, 0.0, 512.0, 512.0]}, "chapter4:2": {"src": "assets/chapter-media/v2-chapter4.webp", "size": [1536, 1024], "rect": [1024.0, 0.0, 512.0, 512.0]}, "chapter4:3": {"src": "assets/chapter-media/v2-chapter4.webp", "size": [1536, 1024], "rect": [0.0, 512.0, 512.0, 512.0]}, "chapter4:4": {"src": "assets/chapter-media/v2-chapter4.webp", "size": [1536, 1024], "rect": [512.0, 512.0, 512.0, 512.0]}, "chapter4:5": {"src": "assets/chapter-media/v2-chapter4.webp", "size": [1536, 1024], "rect": [1024.0, 512.0, 512.0, 512.0]}, "chapter5:0": {"src": "assets/chapter-media/v2-chapter5.webp", "size": [1536, 1024], "rect": [0.0, 0.0, 512.0, 512.0]}, "chapter5:1": {"src": "assets/chapter-media/v2-chapter5.webp", "size": [1536, 1024], "rect": [512.0, 0.0, 512.0, 512.0]}, "chapter5:2": {"src": "assets/chapter-media/v2-chapter5.webp", "size": [1536, 1024], "rect": [1024.0, 0.0, 512.0, 512.0]}, "chapter5:3": {"src": "assets/chapter-media/v2-chapter5.webp", "size": [1536, 1024], "rect": [0.0, 512.0, 512.0, 512.0]}, "chapter5:4": {"src": "assets/chapter-media/v2-chapter5.webp", "size": [1536, 1024], "rect": [512.0, 512.0, 512.0, 512.0]}, "chapter5:5": {"src": "assets/chapter-media/v2-chapter5.webp", "size": [1536, 1024], "rect": [1024.0, 512.0, 512.0, 512.0]}, "chapter6:0": {"src": "assets/chapter-media/v2-chapter6.webp", "size": [1536, 1024], "rect": [0.0, 0.0, 512.0, 512.0]}, "chapter6:1": {"src": "assets/chapter-media/v2-chapter6.webp", "size": [1536, 1024], "rect": [512.0, 0.0, 512.0, 512.0]}, "chapter6:2": {"src": "assets/chapter-media/v2-chapter6.webp", "size": [1536, 1024], "rect": [1024.0, 0.0, 512.0, 512.0]}, "chapter6:3": {"src": "assets/chapter-media/v2-chapter6.webp", "size": [1536, 1024], "rect": [0.0, 512.0, 512.0, 512.0]}, "chapter6:4": {"src": "assets/chapter-media/v2-chapter6.webp", "size": [1536, 1024], "rect": [512.0, 512.0, 512.0, 512.0]}, "chapter6:5": {"src": "assets/chapter-media/v2-chapter6.webp", "size": [1536, 1024], "rect": [1024.0, 512.0, 512.0, 512.0]}, "ming7": {"src": "assets/chapter-media/v7-ming-aid.webp", "name": "조선을 지원한 명군", "size": [1536, 1024]}, "register:0": {"src": "assets/chapter-media/v5-register.webp", "size": [1536, 1024], "rect": [2, 514, 764, 508], "name": "주민의 성급한 주장"}, "register:1": {"src": "assets/chapter-media/v5-register.webp", "size": [1536, 1024], "rect": [770, 514, 764, 508], "name": "변화를 살펴보는 주민"}, "register:2": {"src": "assets/chapter-media/v5-register.webp", "size": [1536, 1024], "rect": [2, 2, 764, 508], "name": "재산을 모은 상인의 신분 변화"}, "register:3": {"src": "assets/chapter-media/v5-register.webp", "size": [1536, 1024], "rect": [770, 2, 764, 508], "name": "남아있는 신분 차이"}, "research5": {"src": "assets/chapter-media/v5-education.webp", "size": [1536, 1024], "rect": [1024, 512, 512, 512], "name": "실학·관개 문제 연구"}, "research8:0": {"src": "assets/chapter-media/v8-silhak-research-meeting.webp", "size": [1536, 1024], "name": "자료로 마을의 문제를 연구해요"}, "research8:1": {"src": "assets/chapter-media/v8-silhak-research-farming.webp", "size": [1536, 1024], "name": "농부와 농사 문제를 살펴요"}, "research8:2": {"src": "assets/chapter-media/v8-silhak-research-trade.webp", "size": [1536, 1024], "name": "장시의 물건과 거래를 살펴요"}, "research8:3": {"src": "assets/chapter-media/v8-silhak-research-geography.webp", "size": [1536, 1024], "name": "지도와 우리 지역을 살펴요"}, "route5:0": {"src": "assets/chapter-media/v5-route-tiles.webp", "size": [1536, 1024], "rect": [8, 204, 493, 586]}, "route5:1": {"src": "assets/chapter-media/v5-route-tiles.webp", "size": [1536, 1024], "rect": [516, 264, 498, 503]}, "route5:2": {"src": "assets/chapter-media/v5-route-tiles.webp", "size": [1536, 1024], "rect": [1038, 225, 480, 561]}, "seasons:0": {"src": "assets/chapter-media/v5-seasons.webp", "size": [1536, 1024], "rect": [0, 0, 768, 512], "name": "spring"}, "seasons:1": {"src": "assets/chapter-media/v5-seasons.webp", "size": [1536, 1024], "rect": [768, 0, 768, 512], "name": "summer"}, "seasons:2": {"src": "assets/chapter-media/v5-seasons.webp", "size": [1536, 1024], "rect": [0, 512, 768, 512], "name": "autumn"}, "seasons:3": {"src": "assets/chapter-media/v5-seasons.webp", "size": [1536, 1024], "rect": [768, 512, 768, 512], "name": "winter"}, "supplies:0": {"src": "assets/chapter-media/v2-supplies.webp", "size": [1536, 1024], "rect": [0.0, 0.0, 384.0, 512.0]}, "supplies:1": {"src": "assets/chapter-media/v2-supplies.webp", "size": [1536, 1024], "rect": [384.0, 0.0, 384.0, 512.0]}, "supplies:2": {"src": "assets/chapter-media/v2-supplies.webp", "size": [1536, 1024], "rect": [768.0, 0.0, 384.0, 512.0]}, "supplies:3": {"src": "assets/chapter-media/v2-supplies.webp", "size": [1536, 1024], "rect": [1152.0, 0.0, 384.0, 512.0]}, "supplies:4": {"src": "assets/chapter-media/v2-supplies.webp", "size": [1536, 1024], "rect": [0.0, 512.0, 384.0, 512.0]}, "supplies:5": {"src": "assets/chapter-media/v2-supplies.webp", "size": [1536, 1024], "rect": [384.0, 512.0, 384.0, 512.0]}, "supplies:6": {"src": "assets/chapter-media/v2-supplies.webp", "size": [1536, 1024], "rect": [768.0, 512.0, 384.0, 512.0]}, "supplies:7": {"src": "assets/chapter-media/v2-supplies.webp", "size": [1536, 1024], "rect": [1152.0, 512.0, 384.0, 512.0]}, "warships:0": {"src": "assets/chapter-media/v2-warships.webp", "size": [1536, 1024], "rect": [0.0, 0.0, 768.0, 1024.0]}, "warships:1": {"src": "assets/chapter-media/v2-warships.webp", "size": [1536, 1024], "rect": [768.0, 0.0, 768.0, 1024.0]}, "western:0": {"src": "assets/chapter-media/v2-western.webp", "size": [1536, 1024], "rect": [0.0, 0.0, 768.0, 512.0]}, "western:1": {"src": "assets/chapter-media/v2-western.webp", "size": [1536, 1024], "rect": [768.0, 0.0, 768.0, 512.0]}, "western:2": {"src": "assets/chapter-media/v2-western.webp", "size": [1536, 1024], "rect": [0.0, 512.0, 768.0, 512.0]}, "western:3": {"src": "assets/chapter-media/v2-western.webp", "size": [1536, 1024], "rect": [768.0, 512.0, 768.0, 512.0]}, "winter7": {"src": "assets/chapter-media/v7-winter-hardship.webp", "name": "남한산성의 추위와 식량 부족", "size": [1536, 1024]}};
export const media456 = {"naval": {"src": "assets/chapter-media/v6-video-naval-r2.mp4", "poster": "assets/chapter-media/v6-video-naval-r2.jpg"}, "winter": {"src": "assets/chapter-media/v2-winter.mp4", "poster": "assets/chapter-media/winter.webp"}};
// These optional reading panels add context without adding or changing saved-answer stages.
Object.assign(chapters456[4].missions[2],{
 contextTitle:'수군·의병·명군과 백성이 남긴 기록',
 context:[
  {name:'수군의 활약',art:'chapter4:3',text:'이순신이 이끄는 수군은 바다에서 활약했어요. 식량과 무기, 배를 마련한 준비와 협력이 바탕이 되었어요.'},
  {name:'스스로 나선 의병',art:'chapter4:4',text:'외적의 침입을 물리치려고 백성이 스스로 군대를 만들었어요. 여러 지역에서 나라를 지키려는 노력이 이어졌어요.'},
  {name:'명군의 도움',art:'ming7',text:'명에서 온 군대도 조선을 도왔어요. 이후 청이 침입한 병자호란과 구분해요.'},
  {name:'전쟁을 겪은 백성',art:'chapter4:0',text:'많은 사람이 죽거나 포로로 끌려갔고 땅과 마을, 궁궐 등 국가유산도 피해를 입었어요.'}
 ]
});
Object.assign(chapters456[6].missions[0],{
 contextTitle:'중국을 거쳐 들어온 서양 문물',
 context:[
  {name:'천리경(망원경)',art:'western:1',text:'멀리 있는 것을 크고 자세하게 살펴보는 도구예요.'},
  {name:'자명종(서양 시계)',art:'western:0',text:'정해진 시각이 되면 스스로 소리를 내는 시계예요.'},
  {name:'세계 지도',art:'western:2',text:'더 넓은 세계의 모습을 접하면서 세계를 바라보는 생각이 점차 달라졌어요.'},
  {name:'과학 기술·천주교 서적',art:'western:3',text:'천주교는 처음에는 서양 학문의 하나로 들어왔고, 이후 일부 사람들이 신앙으로 받아들였어요.'}
 ]
});
chapters456[5].missions[1].checkArtLabels=['감자','고구마'];
export const route456={start:42,goal:6,houses:[10,35],blocks:[1,2,3,5,8,12,15,16,19,23,26,30,33,37,38],limit:24};
export const research456={issues:['농사일이 힘들어요','물건을 나르기 어려워요','우리 지역을 잘 몰라요'],evidence:['농부의 농사 경험','시장의 물건과 거래 기록','지역의 지도와 옛 기록'],methods:['농사 기술과 토지 문제 연구','상공업과 교역의 개선 연구','우리 역사와 지리 연구']};
export function routeState456(path){
 if(!Array.isArray(path)||path.length>24)return null;
 let pos=42;const visited=[];
 for(const n of path){if(!Number.isInteger(n)||n<0||n>48||route456.blocks.includes(n)||Math.abs(n%7-pos%7)+Math.abs(Math.floor(n/7)-Math.floor(pos/7))!==1)return null;pos=n;if(route456.houses.includes(n)&&!visited.includes(n))visited.push(n);}
 return {pos,visited,steps:path.length};
}
export function tradeState456(log){
 if(!Array.isArray(log)||log.length>80)return null;
 const b={money:6,beans:4,rice:0,cloth:0,herb:0};const costs={rice:2,cloth:3,herb:1};
 for(const op of log){if(op==='sell'&&b.beans>0){b.beans--;b.money+=2;}
  else if(typeof op==='string'&&op.startsWith('buy:')&&Object.hasOwn(costs,op.slice(4))&&b.money>=costs[op.slice(4)]){b.money-=costs[op.slice(4)];b[op.slice(4)]++;}
  else if(op==='barter:rice'&&b.beans>=2){b.beans-=2;b.rice+=2;}
  else if(op==='barter:cloth'&&b.beans>=2){b.beans-=2;b.cloth++;}else return null;
 }return b;
}
export function extendedCorrect(step,a){
 if(step.kind==='route'){const s=routeState456(a);return !!s&&s.pos===6&&s.visited.length===2;}
 if(step.kind==='naval'&&a?.kind==='naval-v9')return a.hit===50&&Number.isInteger(a.breach)&&a.breach>=0&&a.breach<5;
 if(step.kind==='naval')return Array.isArray(a)&&a.length===12&&a.every((n,i)=>Number.isInteger(n)&&n>=0&&n<12&&Math.floor(n/4)===Math.floor(i/4))&&new Set(a).size===12;
 if(step.kind==='allocation')return Array.isArray(a)&&a.length===4&&a.every(n=>Number.isInteger(n)&&n>=0)&&a.reduce((s,n)=>s+n,0)===step.total&&step.minimum.every((n,i)=>a[i]>=n);
 if(step.kind==='trade'){const b=tradeState456(a);return !!b&&b.rice>=2&&b.cloth>=1&&b.herb>=1;}
 if(step.kind==='research')return Array.isArray(a)&&a.length===2&&a.every(row=>Array.isArray(row)&&row.length===3&&row.every(n=>Number.isInteger(n)&&n>=0&&n<3)&&row[0]===row[1]&&row[0]===row[2])&&a[0][0]!==a[1][0];
 return false;
}
export function extendedSteps(m){
 const evidence=()=>({kind:'evidence',prompt:m.goal,cards:m.cards.map((c,i)=>({...c,title:m.cardTitles?.[i]||c.title})),need:m.need,pictures:m.cardArt,context:m.context,contextTitle:m.contextTitle,why:[m.record,m.extraNote].filter(Boolean).join(' ')});
 const match=(prompt,pairs,pictures,why=m.record)=>({kind:'match',prompt,pairs,pictures,why,context:m.context,contextTitle:m.contextTitle});
 if(m.id===12)return [{kind:'route',prompt:'두 마을에 소식을 전하고 안전한 곳으로 가요.',art:m.art,why:'일본이 침입한 임진왜란(1592년) 초기, 조선은 큰 위기를 맞았어요. 주민에게 소식을 알려 피란을 준비하도록 돕고 백성의 경험도 기록해요. 이 지도와 걸음 수는 학습용 모형이에요.'}];
 if(m.id===13)return [{kind:'evidence',prompt:'출항 전 세 가지 준비를 모두 점검해요.',need:3,cards:[{title:'식량 마련',text:'군사들이 먹을 식량을 준비해요.',tag:'yes'},{title:'무기 점검',text:'무기와 화약을 점검해요.',tag:'yes'},{title:'배 정비',text:'배와 노를 고치고 군사들이 함께 훈련해요.',tag:'yes'}],pictures:['chapter4:1','chapter4:2','chapter4:3'],why:'이순신은 전쟁에 앞서 식량과 무기, 배 등을 준비했어요.'},{kind:'naval',prompt:'준비한 수군과 함께 바닷길을 지켜요.',art:'warships:0',why:'수군은 바다에서 활약하며 일본군의 바닷길을 막는 데 큰 역할을 했어요. 거북선과 판옥선의 협동을 체험했어요. 배 3척과 적선 50척은 훈련 게임 수치이며 실제 함대 규모는 아니에요.'}];
 if([14,19,23].includes(m.id))return [evidence()];
 if(m.id===15)return [12,10,8].map((total,i)=>({kind:'allocation',prompt:['성 안의 물자 12묶음을 나누어요.','한파로 땔감을 더 썼어요. 남은 10묶음을 다시 나누어요.','식량 공급도 끊겼어요. 남은 8묶음을 다시 나누어요.'][i],total,minimum:i===2?[3,2,3]:[4,3,2],free:true,art:'winter7',why:['식량과 땔감, 아픈 사람을 위한 돌봄이 모두 필요했어요.','매서운 추위로 땔감을 더 사용하면서 성 안의 형편이 어려워졌어요.','굶주림과 추위가 깊어졌어요. 물자 수량은 어려운 선택을 이해하기 위한 게임 수치이며, 배분 성공이 실제 전쟁의 승리를 뜻하지 않아요.'][i]})).concat([match('두 주장의 근거를 연결해요. 어느 주장이 더 마음에 와닿는지도 생각해 봐요.',[['계속 싸우자는 주장','청에 굴복하지 않고 명과의 의리를 지키자.'],['화친하자는 주장','백성과 군사의 희생을 줄이고 뒤를 준비하자.']],['chapter4:5','winter7'],'두 주장의 근거를 살피는 활동이에요. 지지하는 입장 자체를 정답·오답으로 나누지 않아요. 실제로는 인조가 청에 항복했어요.')]);
 if(m.id===16)return [match('계절마다 할 일을 골라 한 해 농사를 계획해요.',[['봄 · 어린 모를 논으로','모내기'],['여름 · 벼 사이의 잡초','김매기'],['가을 · 익은 벼','벼 수확'],['벼를 거둔 뒤 · 겨울을 지나 이듬해까지','보리 재배']],['seasons:0','seasons:1','seasons:2','seasons:3'],'모내기와 김매기, 벼 수확을 하고 보리를 심어 이모작을 할 수 있었어요. 지역과 날씨에 따라 농사 시기는 달라져요.')];
 if(m.id===17){const cards=[{title:'감자',text:'척박한 땅에서도 잘 자라는 먹을거리.'},{title:'고구마',text:'백성의 먹을거리를 늘리는 데 도움.'},{title:'고추',text:'외국에서 들어온 작물. 식생활에도 쓰이지만 이 주문에서는 판매용이에요.'},{title:'인삼',text:'이 주문에서는 판매용. 외래 작물로 묶지 않아요.'}];return ['먹을거리 1개와 판매용 작물 1개를 담아요.','척박한 땅에서도 잘 자라 굶주림을 덜어 준 감자와 고구마를 담아요.','장에 팔 고추와 인삼을 담아요.'].map((prompt,i)=>({kind:'evidence',prompt:'그림 주문서 '+(i+1)+' · '+prompt,need:2,cards,pictures:['supplies:0','supplies:1','supplies:2','supplies:3'],validSets:i===0?[[0,2],[0,3],[1,2],[1,3]]:i===1?[[0,1]]:[[2,3]],why:i===0?'먹을거리와 판매할 작물을 함께 마련했어요. 작물의 쓰임은 하나로만 고정되는 것은 아니에요.':i===1?'감자와 고구마는 기르기 쉽고 척박한 땅에서도 잘 자라 굶주림을 덜어 주었어요. 고추도 외국에서 들어왔지만 이 주문은 굶주림을 덜어 준 두 작물을 묻고 있어요.':'고추·인삼·담배 등을 길러 시장에 팔아 이익을 얻는 사람들이 나타났어요. 인삼을 외국에서 새로 들어온 작물로 묶지 않아요.'}));}
 if(m.id===18)return [{kind:'trade',prompt:m.goal,art:m.art,why:'콩을 팔아 받은 동전으로 필요한 물건을 살 수 있어요. 직접 맞바꾸기도 가능하지만 동전은 서로 원하는 물건을 맞추어야 하는 불편을 줄였어요. 장시와 보부상의 활동이 활발해지고 상평통보가 널리 쓰였어요.'}];
 if(m.id===20)return [match(m.goal,m.pairs,m.pairArt)];
 if(m.id===21)return [{kind:'research',prompt:m.goal,art:'research8:0',why:'문제에 맞는 자료와 연구 방법을 연결했어요. 실학자들은 농업·상공업·우리 역사와 지리 등 여러 분야에서 생활의 문제를 연구했어요.'}];
 if(m.id===22)return [{kind:'sort',prompt:m.goal,items:m.items,groups:m.groups,pictures:['chapter6:2','chapter6:5'],note:'자료 속 생각의 주인을 구분해요. 탄압을 정당화하거나 어느 믿음을 따르라고 하는 활동이 아니에요.',why:m.record,art:m.art}];
 return [];
}

