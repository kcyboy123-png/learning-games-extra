// Fixed, versioned teaching content. Generated from the reviewed specifications in work/nets-96.
export const BANK_VERSION="96-v1";
export const CHAPTERS=[
  {
    "id": "basics",
    "title": "상자의 말 배우기",
    "count": 8,
    "description": "면·모서리·꼭짓점과 접는 선을 찾아요."
  },
  {
    "id": "opposite",
    "title": "마주 보는 면",
    "count": 12,
    "description": "상자의 서로 반대쪽을 찾아요."
  },
  {
    "id": "vertex",
    "title": "모이는 꼭짓점",
    "count": 12,
    "description": "떨어진 점이 어디에서 만날까요?"
  },
  {
    "id": "edge",
    "title": "만나는 모서리",
    "count": 12,
    "description": "접으면 하나가 되는 두 선을 찾아요."
  },
  {
    "id": "valid",
    "title": "상자가 될까?",
    "count": 12,
    "description": "겹침과 빈자리를 찾아 이유를 골라요."
  },
  {
    "id": "complete",
    "title": "빠진 면 붙이기",
    "count": 12,
    "description": "하나만 찾고, 가능한 자리도 모두 찾아요."
  },
  {
    "id": "length",
    "title": "길이를 이어 보기",
    "count": 16,
    "description": "다른 길이와 같은 길이의 상자를 비교해요."
  },
  {
    "id": "build",
    "title": "내 힘으로 만들기",
    "count": 12,
    "description": "주어진 면을 지키며 새 전개도를 만들어요."
  }
];
export const BANK=[
  {
    "type": "basics",
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "concept": "면 이름",
    "title": "★가 붙은 넓적한 부분의 이름은?",
    "instruction": "표시한 부분을 보고 이름을 하나 골라요.",
    "answers": [
      "face"
    ],
    "options": [
      {
        "id": "face",
        "label": "면",
        "feedback": "상자를 둘러싸는 넓적한 부분을 면이라고 해요."
      },
      {
        "id": "edge",
        "label": "모서리",
        "feedback": "손바닥으로 덮을 수 있는 부분을 떠올려요."
      },
      {
        "id": "vertex",
        "label": "꼭짓점",
        "feedback": "손바닥으로 덮을 수 있는 부분을 떠올려요."
      }
    ],
    "explanation": "상자를 둘러싸는 넓적한 부분을 면이라고 해요.",
    "hint": "손바닥으로 덮을 수 있는 부분을 떠올려요.",
    "target": 1,
    "focusKind": "face",
    "id": "N001",
    "chapter": "basics",
    "contentVersion": "96-v1",
    "signature": "basics:면 이름",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "함께",
    "misconceptions": [
      "요소와 표시 혼동"
    ],
    "paper": {
      "page": 2,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          2,
          0
        ],
        [
          3,
          0
        ],
        [
          1,
          1
        ],
        [
          1,
          -1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        2,
        0
      ],
      [
        3,
        0
      ],
      [
        1,
        1
      ],
      [
        1,
        -1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "basics",
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "concept": "모서리 이름",
    "title": "★로 표시한 선의 이름은?",
    "instruction": "상자에서 두 면이 만나는 선이에요.",
    "answers": [
      "edge"
    ],
    "options": [
      {
        "id": "vertex",
        "label": "꼭짓점",
        "feedback": "두 면이 맞닿는 기다란 부분이에요."
      },
      {
        "id": "edge",
        "label": "모서리",
        "feedback": "상자에서 두 면이 만나는 선분을 모서리라고 해요."
      },
      {
        "id": "face",
        "label": "면",
        "feedback": "두 면이 맞닿는 기다란 부분이에요."
      }
    ],
    "explanation": "상자에서 두 면이 만나는 선분을 모서리라고 해요.",
    "hint": "두 면이 맞닿는 기다란 부분이에요.",
    "target": "0:e0",
    "focusKind": "edge",
    "id": "N002",
    "chapter": "basics",
    "contentVersion": "96-v1",
    "signature": "basics:모서리 이름",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "함께",
    "misconceptions": [
      "요소와 표시 혼동"
    ],
    "paper": {
      "page": 3,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          2,
          0
        ],
        [
          3,
          0
        ],
        [
          1,
          1
        ],
        [
          1,
          -1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        2,
        0
      ],
      [
        3,
        0
      ],
      [
        1,
        1
      ],
      [
        1,
        -1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "basics",
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "concept": "꼭짓점 이름",
    "title": "★로 표시한 점의 이름은?",
    "instruction": "접힌 상자의 뾰족한 곳을 떠올려요.",
    "answers": [
      "vertex"
    ],
    "options": [
      {
        "id": "edge",
        "label": "모서리",
        "feedback": "선이 아니라 점을 보고 있어요."
      },
      {
        "id": "face",
        "label": "면",
        "feedback": "선이 아니라 점을 보고 있어요."
      },
      {
        "id": "vertex",
        "label": "꼭짓점",
        "feedback": "상자에서 모서리들이 만나는 점을 꼭짓점이라고 해요."
      }
    ],
    "explanation": "상자에서 모서리들이 만나는 점을 꼭짓점이라고 해요.",
    "hint": "선이 아니라 점을 보고 있어요.",
    "target": "0:v0",
    "focusKind": "vertex",
    "id": "N003",
    "chapter": "basics",
    "contentVersion": "96-v1",
    "signature": "basics:꼭짓점 이름",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "함께",
    "misconceptions": [
      "요소와 표시 혼동"
    ],
    "paper": {
      "page": 4,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          2,
          0
        ],
        [
          3,
          0
        ],
        [
          1,
          1
        ],
        [
          1,
          -1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        2,
        0
      ],
      [
        3,
        0
      ],
      [
        1,
        1
      ],
      [
        1,
        -1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "basics",
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "concept": "접는 선",
    "title": "★가 가리키는 점선에서는 무엇을 할까?",
    "instruction": "이어진 두 면 사이의 점선을 찾아요.",
    "answers": [
      "fold"
    ],
    "options": [
      {
        "id": "cut",
        "label": "가위로 잘라요",
        "feedback": "두 면이 이어진 채 움직여야 해요."
      },
      {
        "id": "fold",
        "label": "선을 따라 접어요",
        "feedback": "면 사이의 점선은 종이를 자르지 않고 접는 선이에요."
      },
      {
        "id": "remove",
        "label": "면을 떼어 내요",
        "feedback": "두 면이 이어진 채 움직여야 해요."
      }
    ],
    "explanation": "면 사이의 점선은 종이를 자르지 않고 접는 선이에요.",
    "hint": "두 면이 이어진 채 움직여야 해요.",
    "target": "0:e1",
    "focusKind": "hinge",
    "id": "N004",
    "chapter": "basics",
    "contentVersion": "96-v1",
    "signature": "basics:접는 선",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "함께",
    "misconceptions": [
      "요소와 표시 혼동"
    ],
    "paper": {
      "page": 5,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          2,
          0
        ],
        [
          3,
          0
        ],
        [
          1,
          1
        ],
        [
          1,
          -1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        2,
        0
      ],
      [
        3,
        0
      ],
      [
        1,
        1
      ],
      [
        1,
        -1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "basics",
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "concept": "자르는 선",
    "title": "종이 도안의 바깥 실선에서는 무엇을 할까?",
    "instruction": "★는 도안 바깥쪽의 실선을 가리켜요.",
    "answers": [
      "cut"
    ],
    "options": [
      {
        "id": "fold",
        "label": "바깥 실선도 모두 접어요",
        "feedback": "상자에 쓸 여섯 면은 한 덩어리로 남겨야 해요."
      },
      {
        "id": "cut",
        "label": "바깥 실선을 따라 잘라요",
        "feedback": "오려 접는 도안은 바깥 실선을 따라 자르고, 면 사이 점선을 따라 접어요."
      },
      {
        "id": "inside",
        "label": "면 한가운데를 잘라요",
        "feedback": "상자에 쓸 여섯 면은 한 덩어리로 남겨야 해요."
      }
    ],
    "explanation": "오려 접는 도안은 바깥 실선을 따라 자르고, 면 사이 점선을 따라 접어요.",
    "hint": "상자에 쓸 여섯 면은 한 덩어리로 남겨야 해요.",
    "target": "0:e0",
    "focusKind": "edge",
    "id": "N005",
    "chapter": "basics",
    "contentVersion": "96-v1",
    "signature": "basics:자르는 선",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "스스로",
    "misconceptions": [
      "요소와 표시 혼동"
    ],
    "paper": {
      "page": 6,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          2,
          0
        ],
        [
          3,
          0
        ],
        [
          1,
          1
        ],
        [
          1,
          -1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        2,
        0
      ],
      [
        3,
        0
      ],
      [
        1,
        1
      ],
      [
        1,
        -1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "basics",
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "concept": "면의 수",
    "title": "정육면체의 면은 모두 몇 개일까?",
    "instruction": "접기 전과 접은 뒤의 면 수를 비교해요.",
    "answers": [
      "6"
    ],
    "options": [
      {
        "id": "4",
        "label": "4개",
        "feedback": "위·아래, 앞·뒤, 왼쪽·오른쪽을 세어 봐요."
      },
      {
        "id": "5",
        "label": "5개",
        "feedback": "위·아래, 앞·뒤, 왼쪽·오른쪽을 세어 봐요."
      },
      {
        "id": "6",
        "label": "6개",
        "feedback": "정육면체의 면은 6개예요. 종이를 접어도 면의 수는 바뀌지 않아요."
      },
      {
        "id": "8",
        "label": "8개",
        "feedback": "위·아래, 앞·뒤, 왼쪽·오른쪽을 세어 봐요."
      }
    ],
    "explanation": "정육면체의 면은 6개예요. 종이를 접어도 면의 수는 바뀌지 않아요.",
    "hint": "위·아래, 앞·뒤, 왼쪽·오른쪽을 세어 봐요.",
    "id": "N006",
    "chapter": "basics",
    "contentVersion": "96-v1",
    "signature": "basics:면의 수",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "스스로",
    "misconceptions": [
      "요소와 표시 혼동"
    ],
    "paper": {
      "page": 7,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          2,
          0
        ],
        [
          3,
          0
        ],
        [
          1,
          1
        ],
        [
          1,
          -1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        2,
        0
      ],
      [
        3,
        0
      ],
      [
        1,
        1
      ],
      [
        1,
        -1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "basics",
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "concept": "모서리의 수",
    "title": "접힌 직육면체의 모서리는 모두 몇 개일까?",
    "instruction": "펼친 종이의 선 조각 수와 구별해요.",
    "answers": [
      "12"
    ],
    "options": [
      {
        "id": "6",
        "label": "6개",
        "feedback": "접어서 만나는 두 선은 상자에서 한 모서리로 세어요."
      },
      {
        "id": "8",
        "label": "8개",
        "feedback": "접어서 만나는 두 선은 상자에서 한 모서리로 세어요."
      },
      {
        "id": "12",
        "label": "12개",
        "feedback": "직육면체의 모서리는 12개예요. 위쪽 4개, 아래쪽 4개, 위아래를 잇는 4개예요."
      },
      {
        "id": "24",
        "label": "24개",
        "feedback": "접어서 만나는 두 선은 상자에서 한 모서리로 세어요."
      }
    ],
    "explanation": "직육면체의 모서리는 12개예요. 위쪽 4개, 아래쪽 4개, 위아래를 잇는 4개예요.",
    "hint": "접어서 만나는 두 선은 상자에서 한 모서리로 세어요.",
    "dimensions": [
      4,
      3,
      2
    ],
    "id": "N007",
    "chapter": "basics",
    "contentVersion": "96-v1",
    "signature": "basics:모서리의 수",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "스스로",
    "misconceptions": [
      "요소와 표시 혼동"
    ],
    "paper": {
      "page": 8,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          2,
          0
        ],
        [
          3,
          0
        ],
        [
          1,
          1
        ],
        [
          1,
          -1
        ]
      ],
      "dimensions": [
        4,
        3,
        2
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        2,
        0
      ],
      [
        3,
        0
      ],
      [
        1,
        1
      ],
      [
        1,
        -1
      ]
    ]
  },
  {
    "type": "basics",
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "concept": "꼭짓점의 수",
    "title": "접힌 정육면체의 꼭짓점은 모두 몇 개일까?",
    "instruction": "펼친 종이의 점들을 따로따로 세지 않아요.",
    "answers": [
      "8"
    ],
    "options": [
      {
        "id": "4",
        "label": "4개",
        "feedback": "접으면 여러 점이 같은 꼭짓점에서 만나요."
      },
      {
        "id": "6",
        "label": "6개",
        "feedback": "접으면 여러 점이 같은 꼭짓점에서 만나요."
      },
      {
        "id": "8",
        "label": "8개",
        "feedback": "정육면체의 꼭짓점은 8개예요. 위쪽에 4개, 아래쪽에 4개가 있어요."
      },
      {
        "id": "12",
        "label": "12개",
        "feedback": "접으면 여러 점이 같은 꼭짓점에서 만나요."
      }
    ],
    "explanation": "정육면체의 꼭짓점은 8개예요. 위쪽에 4개, 아래쪽에 4개가 있어요.",
    "hint": "접으면 여러 점이 같은 꼭짓점에서 만나요.",
    "id": "N008",
    "chapter": "basics",
    "contentVersion": "96-v1",
    "signature": "basics:꼭짓점의 수",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "스스로",
    "misconceptions": [
      "요소와 표시 혼동"
    ],
    "paper": {
      "page": 9,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          2,
          0
        ],
        [
          3,
          0
        ],
        [
          1,
          1
        ],
        [
          1,
          -1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        2,
        0
      ],
      [
        3,
        0
      ],
      [
        1,
        1
      ],
      [
        1,
        -1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N009",
    "type": "opposite",
    "labels": [
      "다",
      "나",
      "가",
      "바",
      "마",
      "라"
    ],
    "answers": [
      "1"
    ],
    "options": [
      {
        "id": "0",
        "label": "다 면",
        "face": 0,
        "feedback": "★ 표시가 있는 마 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "1",
        "label": "나 면",
        "face": 1,
        "feedback": "마 면과 나 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요."
      },
      {
        "id": "2",
        "label": "가 면",
        "face": 2,
        "feedback": "★ 표시가 있는 마 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "3",
        "label": "바 면",
        "face": 3,
        "feedback": "★ 표시가 있는 마 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "5",
        "label": "라 면",
        "face": 5,
        "feedback": "★ 표시가 있는 마 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      }
    ],
    "target": 4,
    "title": "마 면과 마주 보는 면은?",
    "instruction": "마주 볼 것 같은 면을 하나 눌러 보세요.",
    "explanation": "마 면과 나 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요.",
    "hint": "★ 표시가 있는 마 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요.",
    "chapter": "opposite",
    "contentVersion": "96-v1",
    "signature": "opposite:one:1,1,1:[[\"0,0\",\"0,1\",\"0,2\",\"1,1\",\"2,1\",\"3,1\"],[[\"0,1\"],[\"2,1\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "상자의 서로 반대쪽을 찾아요.",
    "difficulty": "함께",
    "misconceptions": [
      "이웃한 면과 반대 면 혼동"
    ],
    "paper": {
      "page": 10,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          0,
          2
        ],
        [
          1,
          1
        ],
        [
          2,
          1
        ],
        [
          3,
          1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "다",
        "나",
        "가",
        "바",
        "마",
        "라"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        0,
        2
      ],
      [
        1,
        1
      ],
      [
        2,
        1
      ],
      [
        3,
        1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N010",
    "type": "opposite",
    "labels": [
      "마",
      "가",
      "바",
      "라",
      "다",
      "나"
    ],
    "answers": [
      "4"
    ],
    "options": [
      {
        "id": "0",
        "label": "마 면",
        "face": 0,
        "feedback": "★ 표시가 있는 바 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "1",
        "label": "가 면",
        "face": 1,
        "feedback": "★ 표시가 있는 바 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "3",
        "label": "라 면",
        "face": 3,
        "feedback": "★ 표시가 있는 바 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "4",
        "label": "다 면",
        "face": 4,
        "feedback": "바 면과 다 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요."
      },
      {
        "id": "5",
        "label": "나 면",
        "face": 5,
        "feedback": "★ 표시가 있는 바 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      }
    ],
    "target": 2,
    "title": "바 면과 마주 보는 면은?",
    "instruction": "마주 볼 것 같은 면을 하나 눌러 보세요.",
    "explanation": "바 면과 다 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요.",
    "hint": "★ 표시가 있는 바 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요.",
    "chapter": "opposite",
    "contentVersion": "96-v1",
    "signature": "opposite:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"1,3\",\"2,3\"],[[\"1,1\"],[\"1,3\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "상자의 서로 반대쪽을 찾아요.",
    "difficulty": "함께",
    "misconceptions": [
      "이웃한 면과 반대 면 혼동"
    ],
    "paper": {
      "page": 11,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ],
        [
          -2,
          1
        ],
        [
          -3,
          1
        ],
        [
          -3,
          2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "마",
        "가",
        "바",
        "라",
        "다",
        "나"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ],
      [
        -2,
        1
      ],
      [
        -3,
        1
      ],
      [
        -3,
        2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N011",
    "type": "opposite",
    "labels": [
      "바",
      "마",
      "나",
      "라",
      "가",
      "다"
    ],
    "answers": [
      "3"
    ],
    "options": [
      {
        "id": "1",
        "label": "마 면",
        "face": 1,
        "feedback": "★ 표시가 있는 바 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "2",
        "label": "나 면",
        "face": 2,
        "feedback": "★ 표시가 있는 바 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "3",
        "label": "라 면",
        "face": 3,
        "feedback": "바 면과 라 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요."
      },
      {
        "id": "4",
        "label": "가 면",
        "face": 4,
        "feedback": "★ 표시가 있는 바 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "5",
        "label": "다 면",
        "face": 5,
        "feedback": "★ 표시가 있는 바 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      }
    ],
    "target": 0,
    "title": "바 면과 마주 보는 면은?",
    "instruction": "마주 볼 것 같은 면을 하나 눌러 보세요.",
    "explanation": "바 면과 라 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요.",
    "hint": "★ 표시가 있는 바 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요.",
    "chapter": "opposite",
    "contentVersion": "96-v1",
    "signature": "opposite:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"2,2\",\"2,3\"],[[\"0,0\"],[\"1,2\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "상자의 서로 반대쪽을 찾아요.",
    "difficulty": "함께",
    "misconceptions": [
      "이웃한 면과 반대 면 혼동"
    ],
    "paper": {
      "page": 12,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          1,
          2
        ],
        [
          2,
          2
        ],
        [
          2,
          3
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "바",
        "마",
        "나",
        "라",
        "가",
        "다"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        2
      ],
      [
        2,
        3
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N012",
    "type": "opposite",
    "labels": [
      "다",
      "라",
      "바",
      "마",
      "가",
      "나"
    ],
    "answers": [
      "0"
    ],
    "options": [
      {
        "id": "0",
        "label": "다 면",
        "face": 0,
        "feedback": "나 면과 다 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요."
      },
      {
        "id": "1",
        "label": "라 면",
        "face": 1,
        "feedback": "★ 표시가 있는 나 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "2",
        "label": "바 면",
        "face": 2,
        "feedback": "★ 표시가 있는 나 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "3",
        "label": "마 면",
        "face": 3,
        "feedback": "★ 표시가 있는 나 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "4",
        "label": "가 면",
        "face": 4,
        "feedback": "★ 표시가 있는 나 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      }
    ],
    "target": 5,
    "title": "나 면과 마주 보는 면은?",
    "instruction": "마주 볼 것 같은 면을 하나 눌러 보세요.",
    "explanation": "나 면과 다 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요.",
    "hint": "★ 표시가 있는 나 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요.",
    "chapter": "opposite",
    "contentVersion": "96-v1",
    "signature": "opposite:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"2,1\",\"3,1\",\"3,2\"],[[\"0,0\"],[\"3,2\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "상자의 서로 반대쪽을 찾아요.",
    "difficulty": "함께",
    "misconceptions": [
      "이웃한 면과 반대 면 혼동"
    ],
    "paper": {
      "page": 13,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ],
        [
          -1,
          2
        ],
        [
          -1,
          3
        ],
        [
          -2,
          3
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "다",
        "라",
        "바",
        "마",
        "가",
        "나"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ],
      [
        -1,
        2
      ],
      [
        -1,
        3
      ],
      [
        -2,
        3
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N013",
    "type": "opposite",
    "labels": [
      "마",
      "바",
      "가",
      "다",
      "나",
      "라"
    ],
    "answers": [
      "2"
    ],
    "options": [
      {
        "id": "0",
        "label": "마 면",
        "face": 0,
        "feedback": "★ 표시가 있는 라 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "1",
        "label": "바 면",
        "face": 1,
        "feedback": "★ 표시가 있는 라 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "2",
        "label": "가 면",
        "face": 2,
        "feedback": "라 면과 가 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요."
      },
      {
        "id": "3",
        "label": "다 면",
        "face": 3,
        "feedback": "★ 표시가 있는 라 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "4",
        "label": "나 면",
        "face": 4,
        "feedback": "★ 표시가 있는 라 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      }
    ],
    "target": 5,
    "title": "라 면과 마주 보는 면은?",
    "instruction": "마주 볼 것 같은 면을 하나 눌러 보세요.",
    "explanation": "라 면과 가 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요.",
    "hint": "★ 표시가 있는 라 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요.",
    "chapter": "opposite",
    "contentVersion": "96-v1",
    "signature": "opposite:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"2,1\",\"2,2\",\"3,1\"],[[\"1,1\"],[\"3,1\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "상자의 서로 반대쪽을 찾아요.",
    "difficulty": "스스로",
    "misconceptions": [
      "이웃한 면과 반대 면 혼동"
    ],
    "paper": {
      "page": 14,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          2,
          1
        ],
        [
          2,
          2
        ],
        [
          3,
          1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "마",
        "바",
        "가",
        "다",
        "나",
        "라"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        2,
        1
      ],
      [
        2,
        2
      ],
      [
        3,
        1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N014",
    "type": "opposite",
    "labels": [
      "마",
      "가",
      "나",
      "다",
      "라",
      "바"
    ],
    "answers": [
      "5"
    ],
    "options": [
      {
        "id": "0",
        "label": "마 면",
        "face": 0,
        "feedback": "★ 표시가 있는 가 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "2",
        "label": "나 면",
        "face": 2,
        "feedback": "★ 표시가 있는 가 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "3",
        "label": "다 면",
        "face": 3,
        "feedback": "★ 표시가 있는 가 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "4",
        "label": "라 면",
        "face": 4,
        "feedback": "★ 표시가 있는 가 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "5",
        "label": "바 면",
        "face": 5,
        "feedback": "가 면과 바 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요."
      }
    ],
    "target": 1,
    "title": "가 면과 마주 보는 면은?",
    "instruction": "마주 볼 것 같은 면을 하나 눌러 보세요.",
    "explanation": "가 면과 바 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요.",
    "hint": "★ 표시가 있는 가 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요.",
    "chapter": "opposite",
    "contentVersion": "96-v1",
    "signature": "opposite:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"1,3\",\"2,2\"],[[\"0,1\"],[\"2,2\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "상자의 서로 반대쪽을 찾아요.",
    "difficulty": "스스로",
    "misconceptions": [
      "이웃한 면과 반대 면 혼동"
    ],
    "paper": {
      "page": 15,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          1,
          2
        ],
        [
          1,
          3
        ],
        [
          2,
          2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "마",
        "가",
        "나",
        "다",
        "라",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        1,
        3
      ],
      [
        2,
        2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N015",
    "type": "opposite",
    "labels": [
      "가",
      "마",
      "바",
      "다",
      "라",
      "나"
    ],
    "answers": [
      "3"
    ],
    "options": [
      {
        "id": "0",
        "label": "가 면",
        "face": 0,
        "feedback": "★ 표시가 있는 마 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "2",
        "label": "바 면",
        "face": 2,
        "feedback": "★ 표시가 있는 마 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "3",
        "label": "다 면",
        "face": 3,
        "feedback": "마 면과 다 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요."
      },
      {
        "id": "4",
        "label": "라 면",
        "face": 4,
        "feedback": "★ 표시가 있는 마 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "5",
        "label": "나 면",
        "face": 5,
        "feedback": "★ 표시가 있는 마 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      }
    ],
    "target": 1,
    "title": "마 면과 마주 보는 면은?",
    "instruction": "마주 볼 것 같은 면을 하나 눌러 보세요.",
    "explanation": "마 면과 다 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요.",
    "hint": "★ 표시가 있는 마 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요.",
    "chapter": "opposite",
    "contentVersion": "96-v1",
    "signature": "opposite:one:1,1,1:[[\"0,1\",\"1,0\",\"1,1\",\"1,2\",\"1,3\",\"2,2\"],[[\"1,0\"],[\"1,2\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "상자의 서로 반대쪽을 찾아요.",
    "difficulty": "스스로",
    "misconceptions": [
      "이웃한 면과 반대 면 혼동"
    ],
    "paper": {
      "page": 16,
      "kind": "task",
      "cells": [
        [
          0,
          -1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          -2
        ],
        [
          -1,
          -3
        ],
        [
          -2,
          -2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "마",
        "바",
        "다",
        "라",
        "나"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        -1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        -2
      ],
      [
        -1,
        -3
      ],
      [
        -2,
        -2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N016",
    "type": "opposite",
    "labels": [
      "나",
      "바",
      "라",
      "다",
      "마",
      "가"
    ],
    "answers": [
      "1"
    ],
    "options": [
      {
        "id": "0",
        "label": "나 면",
        "face": 0,
        "feedback": "★ 표시가 있는 가 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "1",
        "label": "바 면",
        "face": 1,
        "feedback": "가 면과 바 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요."
      },
      {
        "id": "2",
        "label": "라 면",
        "face": 2,
        "feedback": "★ 표시가 있는 가 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "3",
        "label": "다 면",
        "face": 3,
        "feedback": "★ 표시가 있는 가 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "4",
        "label": "마 면",
        "face": 4,
        "feedback": "★ 표시가 있는 가 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      }
    ],
    "target": 5,
    "title": "가 면과 마주 보는 면은?",
    "instruction": "마주 볼 것 같은 면을 하나 눌러 보세요.",
    "explanation": "가 면과 바 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요.",
    "hint": "★ 표시가 있는 가 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요.",
    "chapter": "opposite",
    "contentVersion": "96-v1",
    "signature": "opposite:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"1,3\",\"2,1\"],[[\"0,1\"],[\"2,1\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "상자의 서로 반대쪽을 찾아요.",
    "difficulty": "스스로",
    "misconceptions": [
      "이웃한 면과 반대 면 혼동"
    ],
    "paper": {
      "page": 17,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          -1
        ],
        [
          2,
          -1
        ],
        [
          3,
          -1
        ],
        [
          1,
          -2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "나",
        "바",
        "라",
        "다",
        "마",
        "가"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        1,
        -1
      ],
      [
        2,
        -1
      ],
      [
        3,
        -1
      ],
      [
        1,
        -2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N017",
    "type": "opposite",
    "labels": [
      "다",
      "나",
      "바",
      "가",
      "마",
      "라"
    ],
    "answers": [
      "0"
    ],
    "options": [
      {
        "id": "0",
        "label": "다 면",
        "face": 0,
        "feedback": "가 면과 다 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요."
      },
      {
        "id": "1",
        "label": "나 면",
        "face": 1,
        "feedback": "★ 표시가 있는 가 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "2",
        "label": "바 면",
        "face": 2,
        "feedback": "★ 표시가 있는 가 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "4",
        "label": "마 면",
        "face": 4,
        "feedback": "★ 표시가 있는 가 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "5",
        "label": "라 면",
        "face": 5,
        "feedback": "★ 표시가 있는 가 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      }
    ],
    "target": 3,
    "title": "가 면과 마주 보는 면은?",
    "instruction": "마주 볼 것 같은 면을 하나 눌러 보세요.",
    "explanation": "가 면과 다 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요.",
    "hint": "★ 표시가 있는 가 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요.",
    "chapter": "opposite",
    "contentVersion": "96-v1",
    "signature": "opposite:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"2,1\",\"3,1\"],[[\"0,0\"],[\"1,2\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "상자의 서로 반대쪽을 찾아요.",
    "difficulty": "스스로",
    "misconceptions": [
      "이웃한 면과 반대 면 혼동"
    ],
    "paper": {
      "page": 18,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          1,
          2
        ],
        [
          2,
          1
        ],
        [
          3,
          1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "다",
        "나",
        "바",
        "가",
        "마",
        "라"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        1
      ],
      [
        3,
        1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N018",
    "type": "opposite",
    "labels": [
      "바",
      "다",
      "마",
      "가",
      "나",
      "라"
    ],
    "answers": [
      "5"
    ],
    "options": [
      {
        "id": "1",
        "label": "다 면",
        "face": 1,
        "feedback": "★ 표시가 있는 바 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "2",
        "label": "마 면",
        "face": 2,
        "feedback": "★ 표시가 있는 바 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "3",
        "label": "가 면",
        "face": 3,
        "feedback": "★ 표시가 있는 바 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "4",
        "label": "나 면",
        "face": 4,
        "feedback": "★ 표시가 있는 바 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "5",
        "label": "라 면",
        "face": 5,
        "feedback": "바 면과 라 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요."
      }
    ],
    "target": 0,
    "title": "바 면과 마주 보는 면은?",
    "instruction": "마주 볼 것 같은 면을 하나 눌러 보세요.",
    "explanation": "바 면과 라 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요.",
    "hint": "★ 표시가 있는 바 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요.",
    "chapter": "opposite",
    "contentVersion": "96-v1",
    "signature": "opposite:one:1,1,1:[[\"0,1\",\"1,0\",\"1,1\",\"1,2\",\"1,3\",\"2,1\"],[[\"0,1\"],[\"2,1\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "상자의 서로 반대쪽을 찾아요.",
    "difficulty": "스스로",
    "misconceptions": [
      "이웃한 면과 반대 면 혼동"
    ],
    "paper": {
      "page": 19,
      "kind": "task",
      "cells": [
        [
          -1,
          0
        ],
        [
          0,
          1
        ],
        [
          -1,
          1
        ],
        [
          -2,
          1
        ],
        [
          -3,
          1
        ],
        [
          -1,
          2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "바",
        "다",
        "마",
        "가",
        "나",
        "라"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        -1,
        0
      ],
      [
        0,
        1
      ],
      [
        -1,
        1
      ],
      [
        -2,
        1
      ],
      [
        -3,
        1
      ],
      [
        -1,
        2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N019",
    "type": "opposite",
    "labels": [
      "라",
      "바",
      "나",
      "마",
      "가",
      "다"
    ],
    "answers": [
      "0"
    ],
    "options": [
      {
        "id": "0",
        "label": "라 면",
        "face": 0,
        "feedback": "나 면과 라 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요."
      },
      {
        "id": "1",
        "label": "바 면",
        "face": 1,
        "feedback": "★ 표시가 있는 나 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "3",
        "label": "마 면",
        "face": 3,
        "feedback": "★ 표시가 있는 나 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "4",
        "label": "가 면",
        "face": 4,
        "feedback": "★ 표시가 있는 나 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "5",
        "label": "다 면",
        "face": 5,
        "feedback": "★ 표시가 있는 나 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      }
    ],
    "target": 2,
    "title": "나 면과 마주 보는 면은?",
    "instruction": "마주 볼 것 같은 면을 하나 눌러 보세요.",
    "explanation": "나 면과 라 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요.",
    "hint": "★ 표시가 있는 나 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요.",
    "chapter": "opposite",
    "contentVersion": "96-v1",
    "signature": "opposite:one:1,1,1:[[\"0,0\",\"0,1\",\"0,2\",\"1,2\",\"1,3\",\"1,4\"],[[\"0,0\"],[\"0,2\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "상자의 서로 반대쪽을 찾아요.",
    "difficulty": "스스로",
    "misconceptions": [
      "이웃한 면과 반대 면 혼동"
    ],
    "paper": {
      "page": 20,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          2,
          0
        ],
        [
          2,
          -1
        ],
        [
          3,
          -1
        ],
        [
          4,
          -1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "라",
        "바",
        "나",
        "마",
        "가",
        "다"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        2,
        0
      ],
      [
        2,
        -1
      ],
      [
        3,
        -1
      ],
      [
        4,
        -1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N020",
    "type": "opposite",
    "labels": [
      "다",
      "가",
      "라",
      "나",
      "바",
      "마"
    ],
    "answers": [
      "4"
    ],
    "options": [
      {
        "id": "1",
        "label": "가 면",
        "face": 1,
        "feedback": "★ 표시가 있는 다 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "2",
        "label": "라 면",
        "face": 2,
        "feedback": "★ 표시가 있는 다 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "3",
        "label": "나 면",
        "face": 3,
        "feedback": "★ 표시가 있는 다 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      },
      {
        "id": "4",
        "label": "바 면",
        "face": 4,
        "feedback": "다 면과 바 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요."
      },
      {
        "id": "5",
        "label": "마 면",
        "face": 5,
        "feedback": "★ 표시가 있는 다 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요."
      }
    ],
    "target": 0,
    "title": "다 면과 마주 보는 면은?",
    "instruction": "마주 볼 것 같은 면을 하나 눌러 보세요.",
    "explanation": "다 면과 바 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요.",
    "hint": "★ 표시가 있는 다 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요.",
    "chapter": "opposite",
    "contentVersion": "96-v1",
    "signature": "opposite:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"2,1\",\"2,2\",\"3,1\"],[[\"0,0\"],[\"2,2\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "상자의 서로 반대쪽을 찾아요.",
    "difficulty": "스스로",
    "misconceptions": [
      "이웃한 면과 반대 면 혼동"
    ],
    "paper": {
      "page": 21,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          -1
        ],
        [
          1,
          -2
        ],
        [
          2,
          -2
        ],
        [
          1,
          -3
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "다",
        "가",
        "라",
        "나",
        "바",
        "마"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        1,
        -1
      ],
      [
        1,
        -2
      ],
      [
        2,
        -2
      ],
      [
        1,
        -3
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N021",
    "type": "vertex",
    "labels": [
      "다",
      "나",
      "가",
      "바",
      "마",
      "라"
    ],
    "answers": [
      "0:v0"
    ],
    "options": [
      {
        "id": "1:v2",
        "label": "1",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "1:v2"
      },
      {
        "id": "2:v3",
        "label": "2",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "2:v3"
      },
      {
        "id": "0:v0",
        "label": "3",
        "feedback": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
        "markId": "0:v0"
      },
      {
        "id": "3:v2",
        "label": "4",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "3:v2"
      }
    ],
    "target": "4:v1",
    "title": "★ 꼭짓점과 만나는 꼭짓점은?",
    "instruction": "숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.",
    "explanation": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
    "hint": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
    "chapter": "vertex",
    "contentVersion": "96-v1",
    "signature": "vertex:one:1,1,1:[[\"0,0\",\"0,1\",\"0,2\",\"1,1\",\"2,1\",\"3,1\"],[[\"-0.5,-0.5\"],[\"2.5,0.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "떨어진 점이 어디에서 만날까요?",
    "difficulty": "함께",
    "misconceptions": [
      "평면 거리로 판단"
    ],
    "paper": {
      "page": 22,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          0,
          2
        ],
        [
          1,
          1
        ],
        [
          2,
          1
        ],
        [
          3,
          1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "다",
        "나",
        "가",
        "바",
        "마",
        "라"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        0,
        2
      ],
      [
        1,
        1
      ],
      [
        2,
        1
      ],
      [
        3,
        1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N022",
    "type": "vertex",
    "labels": [
      "마",
      "가",
      "바",
      "라",
      "다",
      "나"
    ],
    "answers": [
      "3:v0"
    ],
    "options": [
      {
        "id": "1:v3",
        "label": "1",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "1:v3"
      },
      {
        "id": "4:v0",
        "label": "2",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "4:v0"
      },
      {
        "id": "2:v3",
        "label": "3",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "2:v3"
      },
      {
        "id": "3:v0",
        "label": "4",
        "feedback": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
        "markId": "3:v0"
      }
    ],
    "target": "1:v0",
    "title": "★ 꼭짓점과 만나는 꼭짓점은?",
    "instruction": "숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.",
    "explanation": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
    "hint": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
    "chapter": "vertex",
    "contentVersion": "96-v1",
    "signature": "vertex:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"1,3\",\"2,3\"],[[\"-0.5,1.5\"],[\"0.5,2.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "떨어진 점이 어디에서 만날까요?",
    "difficulty": "함께",
    "misconceptions": [
      "평면 거리로 판단"
    ],
    "paper": {
      "page": 23,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ],
        [
          -2,
          1
        ],
        [
          -3,
          1
        ],
        [
          -3,
          2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "마",
        "가",
        "바",
        "라",
        "다",
        "나"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ],
      [
        -2,
        1
      ],
      [
        -3,
        1
      ],
      [
        -3,
        2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N023",
    "type": "vertex",
    "labels": [
      "바",
      "마",
      "나",
      "라",
      "가",
      "다"
    ],
    "answers": [
      "2:v1",
      "4:v1"
    ],
    "options": [
      {
        "id": "2:v1",
        "label": "1",
        "feedback": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
        "markId": "2:v1"
      },
      {
        "id": "4:v2",
        "label": "2",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "4:v2"
      },
      {
        "id": "5:v2",
        "label": "3",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "5:v2"
      },
      {
        "id": "4:v1",
        "label": "4",
        "feedback": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
        "markId": "4:v1"
      }
    ],
    "target": "0:v1",
    "title": "★ 꼭짓점과 만나는 꼭짓점은?",
    "instruction": "숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.",
    "explanation": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
    "hint": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
    "chapter": "vertex",
    "contentVersion": "96-v1",
    "signature": "vertex:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"2,2\",\"2,3\"],[[\"-0.5,1.5\"],[\"0.5,2.5\"],[\"1.5,3.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "떨어진 점이 어디에서 만날까요?",
    "difficulty": "함께",
    "misconceptions": [
      "평면 거리로 판단"
    ],
    "paper": {
      "page": 24,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          1,
          2
        ],
        [
          2,
          2
        ],
        [
          2,
          3
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "바",
        "마",
        "나",
        "라",
        "가",
        "다"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        2
      ],
      [
        2,
        3
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N024",
    "type": "vertex",
    "labels": [
      "다",
      "라",
      "바",
      "마",
      "가",
      "나"
    ],
    "answers": [
      "1:v3"
    ],
    "options": [
      {
        "id": "0:v0",
        "label": "1",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "0:v0"
      },
      {
        "id": "1:v3",
        "label": "2",
        "feedback": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
        "markId": "1:v3"
      },
      {
        "id": "0:v2",
        "label": "3",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "0:v2"
      },
      {
        "id": "1:v0",
        "label": "4",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "1:v0"
      }
    ],
    "target": "5:v3",
    "title": "★ 꼭짓점과 만나는 꼭짓점은?",
    "instruction": "숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.",
    "explanation": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
    "hint": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
    "chapter": "vertex",
    "contentVersion": "96-v1",
    "signature": "vertex:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"2,1\",\"3,1\",\"3,2\"],[[\"-0.5,-0.5\"],[\"2.5,0.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "떨어진 점이 어디에서 만날까요?",
    "difficulty": "함께",
    "misconceptions": [
      "평면 거리로 판단"
    ],
    "paper": {
      "page": 25,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ],
        [
          -1,
          2
        ],
        [
          -1,
          3
        ],
        [
          -2,
          3
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "다",
        "라",
        "바",
        "마",
        "가",
        "나"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ],
      [
        -1,
        2
      ],
      [
        -1,
        3
      ],
      [
        -2,
        3
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N025",
    "type": "vertex",
    "labels": [
      "마",
      "바",
      "가",
      "다",
      "나",
      "라"
    ],
    "answers": [
      "1:v3",
      "4:v2"
    ],
    "options": [
      {
        "id": "1:v2",
        "label": "1",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "1:v2"
      },
      {
        "id": "2:v1",
        "label": "2",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "2:v1"
      },
      {
        "id": "1:v3",
        "label": "3",
        "feedback": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
        "markId": "1:v3"
      },
      {
        "id": "4:v2",
        "label": "4",
        "feedback": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
        "markId": "4:v2"
      }
    ],
    "target": "5:v2",
    "title": "★ 꼭짓점과 만나는 꼭짓점은?",
    "instruction": "숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.",
    "explanation": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
    "hint": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
    "chapter": "vertex",
    "contentVersion": "96-v1",
    "signature": "vertex:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"2,1\",\"2,2\",\"3,1\"],[[\"-0.5,1.5\"],[\"2.5,2.5\"],[\"3.5,1.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "떨어진 점이 어디에서 만날까요?",
    "difficulty": "스스로",
    "misconceptions": [
      "평면 거리로 판단"
    ],
    "paper": {
      "page": 26,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          2,
          1
        ],
        [
          2,
          2
        ],
        [
          3,
          1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "마",
        "바",
        "가",
        "다",
        "나",
        "라"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        2,
        1
      ],
      [
        2,
        2
      ],
      [
        3,
        1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N026",
    "type": "vertex",
    "labels": [
      "마",
      "가",
      "나",
      "다",
      "라",
      "바"
    ],
    "answers": [
      "4:v3"
    ],
    "options": [
      {
        "id": "0:v0",
        "label": "1",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "0:v0"
      },
      {
        "id": "4:v2",
        "label": "2",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "4:v2"
      },
      {
        "id": "4:v3",
        "label": "3",
        "feedback": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
        "markId": "4:v3"
      },
      {
        "id": "3:v2",
        "label": "4",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "3:v2"
      }
    ],
    "target": "0:v3",
    "title": "★ 꼭짓점과 만나는 꼭짓점은?",
    "instruction": "숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.",
    "explanation": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
    "hint": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
    "chapter": "vertex",
    "contentVersion": "96-v1",
    "signature": "vertex:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"1,3\",\"2,2\"],[[\"-0.5,0.5\"],[\"0.5,3.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "떨어진 점이 어디에서 만날까요?",
    "difficulty": "스스로",
    "misconceptions": [
      "평면 거리로 판단"
    ],
    "paper": {
      "page": 27,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          1,
          2
        ],
        [
          1,
          3
        ],
        [
          2,
          2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "마",
        "가",
        "나",
        "다",
        "라",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        1,
        3
      ],
      [
        2,
        2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N027",
    "type": "vertex",
    "labels": [
      "가",
      "마",
      "바",
      "다",
      "라",
      "나"
    ],
    "answers": [
      "5:v3"
    ],
    "options": [
      {
        "id": "0:v3",
        "label": "1",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "0:v3"
      },
      {
        "id": "4:v0",
        "label": "2",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "4:v0"
      },
      {
        "id": "5:v0",
        "label": "3",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "5:v0"
      },
      {
        "id": "5:v3",
        "label": "4",
        "feedback": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
        "markId": "5:v3"
      }
    ],
    "target": "1:v0",
    "title": "★ 꼭짓점과 만나는 꼭짓점은?",
    "instruction": "숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.",
    "explanation": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
    "hint": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
    "chapter": "vertex",
    "contentVersion": "96-v1",
    "signature": "vertex:one:1,1,1:[[\"0,1\",\"1,0\",\"1,1\",\"1,2\",\"1,3\",\"2,2\"],[[\"-0.5,1.5\"],[\"0.5,2.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "떨어진 점이 어디에서 만날까요?",
    "difficulty": "스스로",
    "misconceptions": [
      "평면 거리로 판단"
    ],
    "paper": {
      "page": 28,
      "kind": "task",
      "cells": [
        [
          0,
          -1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          -2
        ],
        [
          -1,
          -3
        ],
        [
          -2,
          -2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "마",
        "바",
        "다",
        "라",
        "나"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        -1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        -2
      ],
      [
        -1,
        -3
      ],
      [
        -2,
        -2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N028",
    "type": "vertex",
    "labels": [
      "나",
      "바",
      "라",
      "다",
      "마",
      "가"
    ],
    "answers": [
      "3:v1"
    ],
    "options": [
      {
        "id": "0:v0",
        "label": "1",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "0:v0"
      },
      {
        "id": "3:v1",
        "label": "2",
        "feedback": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
        "markId": "3:v1"
      },
      {
        "id": "1:v1",
        "label": "3",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "1:v1"
      },
      {
        "id": "3:v2",
        "label": "4",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "3:v2"
      }
    ],
    "target": "5:v1",
    "title": "★ 꼭짓점과 만나는 꼭짓점은?",
    "instruction": "숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.",
    "explanation": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
    "hint": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
    "chapter": "vertex",
    "contentVersion": "96-v1",
    "signature": "vertex:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"1,3\",\"2,1\"],[[\"1.5,2.5\"],[\"2.5,1.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "떨어진 점이 어디에서 만날까요?",
    "difficulty": "스스로",
    "misconceptions": [
      "평면 거리로 판단"
    ],
    "paper": {
      "page": 29,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          -1
        ],
        [
          2,
          -1
        ],
        [
          3,
          -1
        ],
        [
          1,
          -2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "나",
        "바",
        "라",
        "다",
        "마",
        "가"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        1,
        -1
      ],
      [
        2,
        -1
      ],
      [
        3,
        -1
      ],
      [
        1,
        -2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N029",
    "type": "vertex",
    "labels": [
      "다",
      "나",
      "바",
      "가",
      "마",
      "라"
    ],
    "answers": [
      "0:v0"
    ],
    "options": [
      {
        "id": "0:v2",
        "label": "1",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "0:v2"
      },
      {
        "id": "4:v2",
        "label": "2",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "4:v2"
      },
      {
        "id": "2:v1",
        "label": "3",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "2:v1"
      },
      {
        "id": "0:v0",
        "label": "4",
        "feedback": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
        "markId": "0:v0"
      }
    ],
    "target": "4:v1",
    "title": "★ 꼭짓점과 만나는 꼭짓점은?",
    "instruction": "숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.",
    "explanation": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
    "hint": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
    "chapter": "vertex",
    "contentVersion": "96-v1",
    "signature": "vertex:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"2,1\",\"3,1\"],[[\"-0.5,-0.5\"],[\"2.5,0.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "떨어진 점이 어디에서 만날까요?",
    "difficulty": "스스로",
    "misconceptions": [
      "평면 거리로 판단"
    ],
    "paper": {
      "page": 30,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          1,
          2
        ],
        [
          2,
          1
        ],
        [
          3,
          1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "다",
        "나",
        "바",
        "가",
        "마",
        "라"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        1
      ],
      [
        3,
        1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N030",
    "type": "vertex",
    "labels": [
      "바",
      "다",
      "마",
      "가",
      "나",
      "라"
    ],
    "answers": [
      "3:v0"
    ],
    "options": [
      {
        "id": "0:v3",
        "label": "1",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "0:v3"
      },
      {
        "id": "5:v2",
        "label": "2",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "5:v2"
      },
      {
        "id": "3:v0",
        "label": "3",
        "feedback": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
        "markId": "3:v0"
      },
      {
        "id": "1:v3",
        "label": "4",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "1:v3"
      }
    ],
    "target": "0:v0",
    "title": "★ 꼭짓점과 만나는 꼭짓점은?",
    "instruction": "숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.",
    "explanation": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
    "hint": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
    "chapter": "vertex",
    "contentVersion": "96-v1",
    "signature": "vertex:one:1,1,1:[[\"0,1\",\"1,0\",\"1,1\",\"1,2\",\"1,3\",\"2,1\"],[[\"-0.5,1.5\"],[\"0.5,2.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "떨어진 점이 어디에서 만날까요?",
    "difficulty": "스스로",
    "misconceptions": [
      "평면 거리로 판단"
    ],
    "paper": {
      "page": 31,
      "kind": "task",
      "cells": [
        [
          -1,
          0
        ],
        [
          0,
          1
        ],
        [
          -1,
          1
        ],
        [
          -2,
          1
        ],
        [
          -3,
          1
        ],
        [
          -1,
          2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "바",
        "다",
        "마",
        "가",
        "나",
        "라"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        -1,
        0
      ],
      [
        0,
        1
      ],
      [
        -1,
        1
      ],
      [
        -2,
        1
      ],
      [
        -3,
        1
      ],
      [
        -1,
        2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N031",
    "type": "vertex",
    "labels": [
      "라",
      "바",
      "나",
      "마",
      "가",
      "다"
    ],
    "answers": [
      "4:v2"
    ],
    "options": [
      {
        "id": "3:v0",
        "label": "1",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "3:v0"
      },
      {
        "id": "0:v0",
        "label": "2",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "0:v0"
      },
      {
        "id": "0:v1",
        "label": "3",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "0:v1"
      },
      {
        "id": "4:v2",
        "label": "4",
        "feedback": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
        "markId": "4:v2"
      }
    ],
    "target": "2:v2",
    "title": "★ 꼭짓점과 만나는 꼭짓점은?",
    "instruction": "숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.",
    "explanation": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
    "hint": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
    "chapter": "vertex",
    "contentVersion": "96-v1",
    "signature": "vertex:one:1,1,1:[[\"0,0\",\"0,1\",\"0,2\",\"1,2\",\"1,3\",\"1,4\"],[[\"-0.5,2.5\"],[\"0.5,3.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "떨어진 점이 어디에서 만날까요?",
    "difficulty": "스스로",
    "misconceptions": [
      "평면 거리로 판단"
    ],
    "paper": {
      "page": 32,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          2,
          0
        ],
        [
          2,
          -1
        ],
        [
          3,
          -1
        ],
        [
          4,
          -1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "라",
        "바",
        "나",
        "마",
        "가",
        "다"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        2,
        0
      ],
      [
        2,
        -1
      ],
      [
        3,
        -1
      ],
      [
        4,
        -1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N032",
    "type": "vertex",
    "labels": [
      "다",
      "가",
      "라",
      "나",
      "바",
      "마"
    ],
    "answers": [
      "2:v0"
    ],
    "options": [
      {
        "id": "2:v1",
        "label": "1",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "2:v1"
      },
      {
        "id": "3:v1",
        "label": "2",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "3:v1"
      },
      {
        "id": "5:v1",
        "label": "3",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "5:v1"
      },
      {
        "id": "2:v0",
        "label": "4",
        "feedback": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
        "markId": "2:v0"
      }
    ],
    "target": "0:v0",
    "title": "★ 꼭짓점과 만나는 꼭짓점은?",
    "instruction": "숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.",
    "explanation": "펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.",
    "hint": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
    "chapter": "vertex",
    "contentVersion": "96-v1",
    "signature": "vertex:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"2,1\",\"2,2\",\"3,1\"],[[\"0.5,-0.5\"],[\"1.5,0.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "떨어진 점이 어디에서 만날까요?",
    "difficulty": "스스로",
    "misconceptions": [
      "평면 거리로 판단"
    ],
    "paper": {
      "page": 33,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          -1
        ],
        [
          1,
          -2
        ],
        [
          2,
          -2
        ],
        [
          1,
          -3
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "다",
        "가",
        "라",
        "나",
        "바",
        "마"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        1,
        -1
      ],
      [
        1,
        -2
      ],
      [
        2,
        -2
      ],
      [
        1,
        -3
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N033",
    "type": "edge",
    "labels": [
      "다",
      "나",
      "가",
      "바",
      "마",
      "라"
    ],
    "answers": [
      "2:e2"
    ],
    "options": [
      {
        "id": "1:e3",
        "label": "1",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "1:e3"
      },
      {
        "id": "3:e0",
        "label": "2",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "3:e0"
      },
      {
        "id": "2:e2",
        "label": "3",
        "feedback": "펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.",
        "markId": "2:e2"
      },
      {
        "id": "4:e0",
        "label": "4",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "4:e0"
      }
    ],
    "target": "4:e2",
    "title": "★ 모서리와 만나는 모서리는?",
    "instruction": "숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.",
    "explanation": "펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.",
    "hint": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
    "chapter": "edge",
    "contentVersion": "96-v1",
    "signature": "edge:one:1,1,1:[[\"0,0\",\"0,1\",\"0,2\",\"1,1\",\"2,1\",\"3,1\"],[[\"-0.5,-0.5\",\"0.5,-0.5\"],[\"1.5,0.5\",\"2.5,0.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "접으면 하나가 되는 두 선을 찾아요.",
    "difficulty": "함께",
    "misconceptions": [
      "접는 선과 만나는 경계선 혼동"
    ],
    "paper": {
      "page": 34,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          0,
          2
        ],
        [
          1,
          1
        ],
        [
          2,
          1
        ],
        [
          3,
          1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "다",
        "나",
        "가",
        "바",
        "마",
        "라"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        0,
        2
      ],
      [
        1,
        1
      ],
      [
        2,
        1
      ],
      [
        3,
        1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N034",
    "type": "edge",
    "labels": [
      "마",
      "가",
      "바",
      "라",
      "다",
      "나"
    ],
    "answers": [
      "0:e2"
    ],
    "options": [
      {
        "id": "2:e2",
        "label": "1",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "2:e2"
      },
      {
        "id": "4:e3",
        "label": "2",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "4:e3"
      },
      {
        "id": "3:e2",
        "label": "3",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "3:e2"
      },
      {
        "id": "0:e2",
        "label": "4",
        "feedback": "펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.",
        "markId": "0:e2"
      }
    ],
    "target": "2:e1",
    "title": "★ 모서리와 만나는 모서리는?",
    "instruction": "숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.",
    "explanation": "펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.",
    "hint": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
    "chapter": "edge",
    "contentVersion": "96-v1",
    "signature": "edge:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"1,3\",\"2,3\"],[[\"0.5,-0.5\",\"0.5,0.5\"],[\"0.5,0.5\",\"1.5,0.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "접으면 하나가 되는 두 선을 찾아요.",
    "difficulty": "함께",
    "misconceptions": [
      "접는 선과 만나는 경계선 혼동"
    ],
    "paper": {
      "page": 35,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ],
        [
          -2,
          1
        ],
        [
          -3,
          1
        ],
        [
          -3,
          2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "마",
        "가",
        "바",
        "라",
        "다",
        "나"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ],
      [
        -2,
        1
      ],
      [
        -3,
        1
      ],
      [
        -3,
        2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N035",
    "type": "edge",
    "labels": [
      "바",
      "마",
      "나",
      "라",
      "가",
      "다"
    ],
    "answers": [
      "5:e1"
    ],
    "options": [
      {
        "id": "5:e1",
        "label": "1",
        "feedback": "펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.",
        "markId": "5:e1"
      },
      {
        "id": "1:e2",
        "label": "2",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "1:e2"
      },
      {
        "id": "5:e2",
        "label": "3",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "5:e2"
      },
      {
        "id": "4:e0",
        "label": "4",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "4:e0"
      }
    ],
    "target": "0:e3",
    "title": "★ 모서리와 만나는 모서리는?",
    "instruction": "숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.",
    "explanation": "펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.",
    "hint": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
    "chapter": "edge",
    "contentVersion": "96-v1",
    "signature": "edge:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"2,2\",\"2,3\"],[[\"-0.5,-0.5\",\"-0.5,0.5\"],[\"2.5,2.5\",\"2.5,3.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "접으면 하나가 되는 두 선을 찾아요.",
    "difficulty": "함께",
    "misconceptions": [
      "접는 선과 만나는 경계선 혼동"
    ],
    "paper": {
      "page": 36,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          1,
          2
        ],
        [
          2,
          2
        ],
        [
          2,
          3
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "바",
        "마",
        "나",
        "라",
        "가",
        "다"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        2
      ],
      [
        2,
        3
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N036",
    "type": "edge",
    "labels": [
      "다",
      "라",
      "바",
      "마",
      "가",
      "나"
    ],
    "answers": [
      "2:e3"
    ],
    "options": [
      {
        "id": "0:e0",
        "label": "1",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "0:e0"
      },
      {
        "id": "2:e3",
        "label": "2",
        "feedback": "펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.",
        "markId": "2:e3"
      },
      {
        "id": "0:e2",
        "label": "3",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "0:e2"
      },
      {
        "id": "1:e3",
        "label": "4",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "1:e3"
      }
    ],
    "target": "5:e3",
    "title": "★ 모서리와 만나는 모서리는?",
    "instruction": "숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.",
    "explanation": "펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.",
    "hint": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
    "chapter": "edge",
    "contentVersion": "96-v1",
    "signature": "edge:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"2,1\",\"3,1\",\"3,2\"],[[\"-0.5,-0.5\",\"0.5,-0.5\"],[\"1.5,0.5\",\"2.5,0.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "접으면 하나가 되는 두 선을 찾아요.",
    "difficulty": "함께",
    "misconceptions": [
      "접는 선과 만나는 경계선 혼동"
    ],
    "paper": {
      "page": 37,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ],
        [
          -1,
          2
        ],
        [
          -1,
          3
        ],
        [
          -2,
          3
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "다",
        "라",
        "바",
        "마",
        "가",
        "나"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ],
      [
        -1,
        2
      ],
      [
        -1,
        3
      ],
      [
        -2,
        3
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N037",
    "type": "edge",
    "labels": [
      "마",
      "바",
      "가",
      "다",
      "나",
      "라"
    ],
    "answers": [
      "1:e3"
    ],
    "options": [
      {
        "id": "0:e1",
        "label": "1",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "0:e1"
      },
      {
        "id": "2:e0",
        "label": "2",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "2:e0"
      },
      {
        "id": "3:e0",
        "label": "3",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "3:e0"
      },
      {
        "id": "1:e3",
        "label": "4",
        "feedback": "펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.",
        "markId": "1:e3"
      }
    ],
    "target": "5:e1",
    "title": "★ 모서리와 만나는 모서리는?",
    "instruction": "숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.",
    "explanation": "펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.",
    "hint": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
    "chapter": "edge",
    "contentVersion": "96-v1",
    "signature": "edge:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"2,1\",\"2,2\",\"3,1\"],[[\"-0.5,0.5\",\"-0.5,1.5\"],[\"3.5,0.5\",\"3.5,1.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "접으면 하나가 되는 두 선을 찾아요.",
    "difficulty": "스스로",
    "misconceptions": [
      "접는 선과 만나는 경계선 혼동"
    ],
    "paper": {
      "page": 38,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          2,
          1
        ],
        [
          2,
          2
        ],
        [
          3,
          1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "마",
        "바",
        "가",
        "다",
        "나",
        "라"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        2,
        1
      ],
      [
        2,
        2
      ],
      [
        3,
        1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N038",
    "type": "edge",
    "labels": [
      "마",
      "가",
      "나",
      "다",
      "라",
      "바"
    ],
    "answers": [
      "3:e3"
    ],
    "options": [
      {
        "id": "0:e0",
        "label": "1",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "0:e0"
      },
      {
        "id": "5:e0",
        "label": "2",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "5:e0"
      },
      {
        "id": "3:e3",
        "label": "3",
        "feedback": "펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.",
        "markId": "3:e3"
      },
      {
        "id": "4:e2",
        "label": "4",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "4:e2"
      }
    ],
    "target": "1:e2",
    "title": "★ 모서리와 만나는 모서리는?",
    "instruction": "숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.",
    "explanation": "펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.",
    "hint": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
    "chapter": "edge",
    "contentVersion": "96-v1",
    "signature": "edge:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"1,3\",\"2,2\"],[[\"-0.5,1.5\",\"0.5,1.5\"],[\"0.5,1.5\",\"0.5,2.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "접으면 하나가 되는 두 선을 찾아요.",
    "difficulty": "스스로",
    "misconceptions": [
      "접는 선과 만나는 경계선 혼동"
    ],
    "paper": {
      "page": 39,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          1,
          2
        ],
        [
          1,
          3
        ],
        [
          2,
          2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "마",
        "가",
        "나",
        "다",
        "라",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        1,
        3
      ],
      [
        2,
        2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N039",
    "type": "edge",
    "labels": [
      "가",
      "마",
      "바",
      "다",
      "라",
      "나"
    ],
    "answers": [
      "0:e2"
    ],
    "options": [
      {
        "id": "1:e3",
        "label": "1",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "1:e3"
      },
      {
        "id": "5:e0",
        "label": "2",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "5:e0"
      },
      {
        "id": "5:e3",
        "label": "3",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "5:e3"
      },
      {
        "id": "0:e2",
        "label": "4",
        "feedback": "펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.",
        "markId": "0:e2"
      }
    ],
    "target": "1:e1",
    "title": "★ 모서리와 만나는 모서리는?",
    "instruction": "숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.",
    "explanation": "펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.",
    "hint": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
    "chapter": "edge",
    "contentVersion": "96-v1",
    "signature": "edge:one:1,1,1:[[\"0,1\",\"1,0\",\"1,1\",\"1,2\",\"1,3\",\"2,2\"],[[\"-0.5,0.5\",\"0.5,0.5\"],[\"0.5,-0.5\",\"0.5,0.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "접으면 하나가 되는 두 선을 찾아요.",
    "difficulty": "스스로",
    "misconceptions": [
      "접는 선과 만나는 경계선 혼동"
    ],
    "paper": {
      "page": 40,
      "kind": "task",
      "cells": [
        [
          0,
          -1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          -2
        ],
        [
          -1,
          -3
        ],
        [
          -2,
          -2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "마",
        "바",
        "다",
        "라",
        "나"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        -1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        -2
      ],
      [
        -1,
        -3
      ],
      [
        -2,
        -2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N040",
    "type": "edge",
    "labels": [
      "나",
      "바",
      "라",
      "다",
      "마",
      "가"
    ],
    "answers": [
      "3:e0"
    ],
    "options": [
      {
        "id": "0:e0",
        "label": "1",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "0:e0"
      },
      {
        "id": "3:e0",
        "label": "2",
        "feedback": "펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.",
        "markId": "3:e0"
      },
      {
        "id": "1:e2",
        "label": "3",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "1:e2"
      },
      {
        "id": "4:e1",
        "label": "4",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "4:e1"
      }
    ],
    "target": "5:e1",
    "title": "★ 모서리와 만나는 모서리는?",
    "instruction": "숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.",
    "explanation": "펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.",
    "hint": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
    "chapter": "edge",
    "contentVersion": "96-v1",
    "signature": "edge:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"1,3\",\"2,1\"],[[\"1.5,1.5\",\"1.5,2.5\"],[\"1.5,1.5\",\"2.5,1.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "접으면 하나가 되는 두 선을 찾아요.",
    "difficulty": "스스로",
    "misconceptions": [
      "접는 선과 만나는 경계선 혼동"
    ],
    "paper": {
      "page": 41,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          -1
        ],
        [
          2,
          -1
        ],
        [
          3,
          -1
        ],
        [
          1,
          -2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "나",
        "바",
        "라",
        "다",
        "마",
        "가"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        1,
        -1
      ],
      [
        2,
        -1
      ],
      [
        3,
        -1
      ],
      [
        1,
        -2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N041",
    "type": "edge",
    "labels": [
      "다",
      "나",
      "바",
      "가",
      "마",
      "라"
    ],
    "answers": [
      "1:e2"
    ],
    "options": [
      {
        "id": "0:e1",
        "label": "1",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "0:e1"
      },
      {
        "id": "5:e0",
        "label": "2",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "5:e0"
      },
      {
        "id": "3:e1",
        "label": "3",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "3:e1"
      },
      {
        "id": "1:e2",
        "label": "4",
        "feedback": "펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.",
        "markId": "1:e2"
      }
    ],
    "target": "3:e3",
    "title": "★ 모서리와 만나는 모서리는?",
    "instruction": "숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.",
    "explanation": "펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.",
    "hint": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
    "chapter": "edge",
    "contentVersion": "96-v1",
    "signature": "edge:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"2,1\",\"3,1\"],[[\"-0.5,1.5\",\"0.5,1.5\"],[\"0.5,1.5\",\"0.5,2.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "접으면 하나가 되는 두 선을 찾아요.",
    "difficulty": "스스로",
    "misconceptions": [
      "접는 선과 만나는 경계선 혼동"
    ],
    "paper": {
      "page": 42,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          1,
          2
        ],
        [
          2,
          1
        ],
        [
          3,
          1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "다",
        "나",
        "바",
        "가",
        "마",
        "라"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        1
      ],
      [
        3,
        1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N042",
    "type": "edge",
    "labels": [
      "바",
      "다",
      "마",
      "가",
      "나",
      "라"
    ],
    "answers": [
      "4:e0"
    ],
    "options": [
      {
        "id": "1:e0",
        "label": "1",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "1:e0"
      },
      {
        "id": "5:e2",
        "label": "2",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "5:e2"
      },
      {
        "id": "4:e0",
        "label": "3",
        "feedback": "펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.",
        "markId": "4:e0"
      },
      {
        "id": "3:e0",
        "label": "4",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "3:e0"
      }
    ],
    "target": "0:e0",
    "title": "★ 모서리와 만나는 모서리는?",
    "instruction": "숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.",
    "explanation": "펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.",
    "hint": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
    "chapter": "edge",
    "contentVersion": "96-v1",
    "signature": "edge:one:1,1,1:[[\"0,1\",\"1,0\",\"1,1\",\"1,2\",\"1,3\",\"2,1\"],[[\"-0.5,0.5\",\"-0.5,1.5\"],[\"0.5,2.5\",\"0.5,3.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "접으면 하나가 되는 두 선을 찾아요.",
    "difficulty": "스스로",
    "misconceptions": [
      "접는 선과 만나는 경계선 혼동"
    ],
    "paper": {
      "page": 43,
      "kind": "task",
      "cells": [
        [
          -1,
          0
        ],
        [
          0,
          1
        ],
        [
          -1,
          1
        ],
        [
          -2,
          1
        ],
        [
          -3,
          1
        ],
        [
          -1,
          2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "바",
        "다",
        "마",
        "가",
        "나",
        "라"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        -1,
        0
      ],
      [
        0,
        1
      ],
      [
        -1,
        1
      ],
      [
        -2,
        1
      ],
      [
        -3,
        1
      ],
      [
        -1,
        2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N043",
    "type": "edge",
    "labels": [
      "라",
      "바",
      "나",
      "마",
      "가",
      "다"
    ],
    "answers": [
      "5:e2"
    ],
    "options": [
      {
        "id": "3:e3",
        "label": "1",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "3:e3"
      },
      {
        "id": "0:e0",
        "label": "2",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "0:e0"
      },
      {
        "id": "0:e2",
        "label": "3",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "0:e2"
      },
      {
        "id": "5:e2",
        "label": "4",
        "feedback": "펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.",
        "markId": "5:e2"
      }
    ],
    "target": "2:e2",
    "title": "★ 모서리와 만나는 모서리는?",
    "instruction": "숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.",
    "explanation": "펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.",
    "hint": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
    "chapter": "edge",
    "contentVersion": "96-v1",
    "signature": "edge:one:1,1,1:[[\"0,0\",\"0,1\",\"0,2\",\"1,2\",\"1,3\",\"1,4\"],[[\"-0.5,1.5\",\"-0.5,2.5\"],[\"0.5,3.5\",\"0.5,4.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "접으면 하나가 되는 두 선을 찾아요.",
    "difficulty": "스스로",
    "misconceptions": [
      "접는 선과 만나는 경계선 혼동"
    ],
    "paper": {
      "page": 44,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          2,
          0
        ],
        [
          2,
          -1
        ],
        [
          3,
          -1
        ],
        [
          4,
          -1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "라",
        "바",
        "나",
        "마",
        "가",
        "다"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        2,
        0
      ],
      [
        2,
        -1
      ],
      [
        3,
        -1
      ],
      [
        4,
        -1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N044",
    "type": "edge",
    "labels": [
      "마",
      "다",
      "바",
      "가",
      "라",
      "나"
    ],
    "answers": [
      "0:e0"
    ],
    "options": [
      {
        "id": "5:e0",
        "label": "1",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "5:e0"
      },
      {
        "id": "4:e3",
        "label": "2",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "4:e3"
      },
      {
        "id": "0:e0",
        "label": "3",
        "feedback": "펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.",
        "markId": "0:e0"
      },
      {
        "id": "2:e0",
        "label": "4",
        "feedback": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
        "markId": "2:e0"
      }
    ],
    "target": "2:e3",
    "title": "★ 모서리와 만나는 모서리는?",
    "instruction": "숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.",
    "explanation": "펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.",
    "hint": "★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.",
    "chapter": "edge",
    "contentVersion": "96-v1",
    "signature": "edge:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"2,2\",\"2,3\"],[[\"0.5,-0.5\",\"0.5,0.5\"],[\"0.5,0.5\",\"1.5,0.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "접으면 하나가 되는 두 선을 찾아요.",
    "difficulty": "스스로",
    "misconceptions": [
      "접는 선과 만나는 경계선 혼동"
    ],
    "paper": {
      "page": 45,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          -1
        ],
        [
          2,
          -1
        ],
        [
          2,
          -2
        ],
        [
          3,
          -2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "마",
        "다",
        "바",
        "가",
        "라",
        "나"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        1,
        -1
      ],
      [
        2,
        -1
      ],
      [
        2,
        -2
      ],
      [
        3,
        -2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "valid",
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "title": "이 종이를 접으면 어떻게 될까?",
    "instruction": "상자가 되는지, 안 된다면 왜 그런지 골라요.",
    "options": [
      {
        "id": "valid",
        "label": "겹치지 않고 상자가 돼요",
        "feedback": "여섯 면이 겹치지 않고 상자를 닫아요."
      },
      {
        "id": "overlap",
        "label": "면이 겹쳐서 상자가 안 돼요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "cycle",
        "label": "네 면이 둘러 붙어 접을 수 없어요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "count",
        "label": "상자를 닫을 면이 부족해요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      }
    ],
    "answers": [
      "valid"
    ],
    "explanation": "여섯 면이 겹치지 않고 상자를 닫아요.",
    "hint": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요.",
    "concept": "가능 여부와 이유 구별",
    "id": "N045",
    "chapter": "valid",
    "contentVersion": "96-v1",
    "signature": "valid:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"1,3\",\"2,2\"],[]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "함께",
    "misconceptions": [
      "여섯 면이면 항상 가능"
    ],
    "paper": {
      "page": 46,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          1,
          2
        ],
        [
          1,
          3
        ],
        [
          2,
          2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        1,
        3
      ],
      [
        2,
        2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "valid",
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "title": "이 종이를 접으면 어떻게 될까?",
    "instruction": "상자가 되는지, 안 된다면 왜 그런지 골라요.",
    "options": [
      {
        "id": "valid",
        "label": "겹치지 않고 상자가 돼요",
        "feedback": "여섯 면이 겹치지 않고 상자를 닫아요."
      },
      {
        "id": "overlap",
        "label": "면이 겹쳐서 상자가 안 돼요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "cycle",
        "label": "네 면이 둘러 붙어 접을 수 없어요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "count",
        "label": "상자를 닫을 면이 부족해요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      }
    ],
    "answers": [
      "valid"
    ],
    "explanation": "여섯 면이 겹치지 않고 상자를 닫아요.",
    "hint": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요.",
    "concept": "가능 여부와 이유 구별",
    "id": "N046",
    "chapter": "valid",
    "contentVersion": "96-v1",
    "signature": "valid:one:1,1,1:[[\"0,1\",\"1,0\",\"1,1\",\"1,2\",\"1,3\",\"2,2\"],[]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "함께",
    "misconceptions": [
      "여섯 면이면 항상 가능"
    ],
    "paper": {
      "page": 47,
      "kind": "task",
      "cells": [
        [
          0,
          1
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          1,
          2
        ],
        [
          1,
          3
        ],
        [
          2,
          2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        1
      ],
      [
        1,
        0
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        1,
        3
      ],
      [
        2,
        2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "valid",
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "title": "이 종이를 접으면 어떻게 될까?",
    "instruction": "상자가 되는지, 안 된다면 왜 그런지 골라요.",
    "options": [
      {
        "id": "valid",
        "label": "겹치지 않고 상자가 돼요",
        "feedback": "여섯 면이 겹치지 않고 상자를 닫아요."
      },
      {
        "id": "overlap",
        "label": "면이 겹쳐서 상자가 안 돼요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "cycle",
        "label": "네 면이 둘러 붙어 접을 수 없어요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "count",
        "label": "상자를 닫을 면이 부족해요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      }
    ],
    "answers": [
      "valid"
    ],
    "explanation": "여섯 면이 겹치지 않고 상자를 닫아요.",
    "hint": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요.",
    "concept": "가능 여부와 이유 구별",
    "id": "N047",
    "chapter": "valid",
    "contentVersion": "96-v1",
    "signature": "valid:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"1,3\",\"2,1\"],[]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "함께",
    "misconceptions": [
      "여섯 면이면 항상 가능"
    ],
    "paper": {
      "page": 48,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          1,
          2
        ],
        [
          1,
          3
        ],
        [
          2,
          1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        1,
        3
      ],
      [
        2,
        1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "valid",
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "title": "이 종이를 접으면 어떻게 될까?",
    "instruction": "상자가 되는지, 안 된다면 왜 그런지 골라요.",
    "options": [
      {
        "id": "valid",
        "label": "겹치지 않고 상자가 돼요",
        "feedback": "여섯 면이 겹치지 않고 상자를 닫아요."
      },
      {
        "id": "overlap",
        "label": "면이 겹쳐서 상자가 안 돼요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "cycle",
        "label": "네 면이 둘러 붙어 접을 수 없어요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "count",
        "label": "상자를 닫을 면이 부족해요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      }
    ],
    "answers": [
      "valid"
    ],
    "explanation": "여섯 면이 겹치지 않고 상자를 닫아요.",
    "hint": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요.",
    "concept": "가능 여부와 이유 구별",
    "id": "N048",
    "chapter": "valid",
    "contentVersion": "96-v1",
    "signature": "valid:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"2,1\",\"3,1\"],[]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "함께",
    "misconceptions": [
      "여섯 면이면 항상 가능"
    ],
    "paper": {
      "page": 49,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          1,
          2
        ],
        [
          2,
          1
        ],
        [
          3,
          1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        1
      ],
      [
        3,
        1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "valid",
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "title": "이 종이를 접으면 어떻게 될까?",
    "instruction": "상자가 되는지, 안 된다면 왜 그런지 골라요.",
    "options": [
      {
        "id": "valid",
        "label": "겹치지 않고 상자가 돼요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "overlap",
        "label": "면이 겹쳐서 상자가 안 돼요",
        "feedback": "두 면이 같은 방향으로 접혀 상자의 빈자리를 모두 채우지 못해요."
      },
      {
        "id": "cycle",
        "label": "네 면이 둘러 붙어 접을 수 없어요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "count",
        "label": "상자를 닫을 면이 부족해요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      }
    ],
    "answers": [
      "overlap"
    ],
    "explanation": "두 면이 같은 방향으로 접혀 상자의 빈자리를 모두 채우지 못해요.",
    "hint": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요.",
    "concept": "가능 여부와 이유 구별",
    "id": "N049",
    "chapter": "valid",
    "contentVersion": "96-v1",
    "signature": "valid:one:1,1,1:[[\"0,0\",\"0,1\",\"0,2\",\"1,2\",\"1,3\",\"2,2\"],[]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "스스로",
    "misconceptions": [
      "여섯 면이면 항상 가능"
    ],
    "paper": {
      "page": 50,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          0,
          2
        ],
        [
          1,
          2
        ],
        [
          1,
          3
        ],
        [
          2,
          2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": false
    },
    "foldSequence": null,
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        0,
        2
      ],
      [
        1,
        2
      ],
      [
        1,
        3
      ],
      [
        2,
        2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "valid",
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "title": "이 종이를 접으면 어떻게 될까?",
    "instruction": "상자가 되는지, 안 된다면 왜 그런지 골라요.",
    "options": [
      {
        "id": "valid",
        "label": "겹치지 않고 상자가 돼요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "overlap",
        "label": "면이 겹쳐서 상자가 안 돼요",
        "feedback": "두 면이 같은 방향으로 접혀 상자의 빈자리를 모두 채우지 못해요."
      },
      {
        "id": "cycle",
        "label": "네 면이 둘러 붙어 접을 수 없어요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "count",
        "label": "상자를 닫을 면이 부족해요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      }
    ],
    "answers": [
      "overlap"
    ],
    "explanation": "두 면이 같은 방향으로 접혀 상자의 빈자리를 모두 채우지 못해요.",
    "hint": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요.",
    "concept": "가능 여부와 이유 구별",
    "id": "N050",
    "chapter": "valid",
    "contentVersion": "96-v1",
    "signature": "valid:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"2,0\",\"2,1\"],[]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "스스로",
    "misconceptions": [
      "여섯 면이면 항상 가능"
    ],
    "paper": {
      "page": 51,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          1,
          2
        ],
        [
          2,
          0
        ],
        [
          2,
          1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": false
    },
    "foldSequence": null,
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        0
      ],
      [
        2,
        1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "valid",
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "title": "이 종이를 접으면 어떻게 될까?",
    "instruction": "상자가 되는지, 안 된다면 왜 그런지 골라요.",
    "options": [
      {
        "id": "valid",
        "label": "겹치지 않고 상자가 돼요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "overlap",
        "label": "면이 겹쳐서 상자가 안 돼요",
        "feedback": "두 면이 같은 방향으로 접혀 상자의 빈자리를 모두 채우지 못해요."
      },
      {
        "id": "cycle",
        "label": "네 면이 둘러 붙어 접을 수 없어요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "count",
        "label": "상자를 닫을 면이 부족해요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      }
    ],
    "answers": [
      "overlap"
    ],
    "explanation": "두 면이 같은 방향으로 접혀 상자의 빈자리를 모두 채우지 못해요.",
    "hint": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요.",
    "concept": "가능 여부와 이유 구별",
    "id": "N051",
    "chapter": "valid",
    "contentVersion": "96-v1",
    "signature": "valid:one:1,1,1:[[\"0,0\",\"0,1\",\"0,2\",\"0,3\",\"0,4\",\"1,2\"],[]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "스스로",
    "misconceptions": [
      "여섯 면이면 항상 가능"
    ],
    "paper": {
      "page": 52,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          0,
          2
        ],
        [
          0,
          3
        ],
        [
          0,
          4
        ],
        [
          1,
          2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": false
    },
    "foldSequence": null,
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        0,
        2
      ],
      [
        0,
        3
      ],
      [
        0,
        4
      ],
      [
        1,
        2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "valid",
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "title": "이 종이를 접으면 어떻게 될까?",
    "instruction": "상자가 되는지, 안 된다면 왜 그런지 골라요.",
    "options": [
      {
        "id": "valid",
        "label": "겹치지 않고 상자가 돼요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "overlap",
        "label": "면이 겹쳐서 상자가 안 돼요",
        "feedback": "두 면이 같은 방향으로 접혀 상자의 빈자리를 모두 채우지 못해요."
      },
      {
        "id": "cycle",
        "label": "네 면이 둘러 붙어 접을 수 없어요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "count",
        "label": "상자를 닫을 면이 부족해요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      }
    ],
    "answers": [
      "overlap"
    ],
    "explanation": "두 면이 같은 방향으로 접혀 상자의 빈자리를 모두 채우지 못해요.",
    "hint": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요.",
    "concept": "가능 여부와 이유 구별",
    "id": "N052",
    "chapter": "valid",
    "contentVersion": "96-v1",
    "signature": "valid:one:1,1,1:[[\"0,0\",\"0,1\",\"0,2\",\"0,3\",\"1,0\",\"1,2\"],[]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "스스로",
    "misconceptions": [
      "여섯 면이면 항상 가능"
    ],
    "paper": {
      "page": 53,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          0,
          2
        ],
        [
          0,
          3
        ],
        [
          1,
          0
        ],
        [
          1,
          2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": false
    },
    "foldSequence": null,
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        0,
        2
      ],
      [
        0,
        3
      ],
      [
        1,
        0
      ],
      [
        1,
        2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "valid",
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "title": "이 종이를 접으면 어떻게 될까?",
    "instruction": "상자가 되는지, 안 된다면 왜 그런지 골라요.",
    "options": [
      {
        "id": "valid",
        "label": "겹치지 않고 상자가 돼요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "overlap",
        "label": "면이 겹쳐서 상자가 안 돼요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "cycle",
        "label": "네 면이 둘러 붙어 접을 수 없어요",
        "feedback": "네 면이 둘러 붙은 곳은 상자의 꼭짓점처럼 접히지 않아요. 면 하나를 옮겨 보세요."
      },
      {
        "id": "count",
        "label": "상자를 닫을 면이 부족해요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      }
    ],
    "answers": [
      "cycle"
    ],
    "explanation": "네 면이 둘러 붙은 곳은 상자의 꼭짓점처럼 접히지 않아요. 면 하나를 옮겨 보세요.",
    "hint": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요.",
    "concept": "가능 여부와 이유 구별",
    "id": "N053",
    "chapter": "valid",
    "contentVersion": "96-v1",
    "signature": "valid:one:1,1,1:[[\"0,0\",\"0,1\",\"0,2\",\"1,0\",\"1,1\",\"2,1\"],[]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "스스로",
    "misconceptions": [
      "여섯 면이면 항상 가능"
    ],
    "paper": {
      "page": 54,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          0,
          2
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          2,
          1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": false
    },
    "foldSequence": null,
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        0,
        2
      ],
      [
        1,
        0
      ],
      [
        1,
        1
      ],
      [
        2,
        1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "valid",
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "title": "이 종이를 접으면 어떻게 될까?",
    "instruction": "상자가 되는지, 안 된다면 왜 그런지 골라요.",
    "options": [
      {
        "id": "valid",
        "label": "겹치지 않고 상자가 돼요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "overlap",
        "label": "면이 겹쳐서 상자가 안 돼요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "cycle",
        "label": "네 면이 둘러 붙어 접을 수 없어요",
        "feedback": "네 면이 둘러 붙은 곳은 상자의 꼭짓점처럼 접히지 않아요. 면 하나를 옮겨 보세요."
      },
      {
        "id": "count",
        "label": "상자를 닫을 면이 부족해요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      }
    ],
    "answers": [
      "cycle"
    ],
    "explanation": "네 면이 둘러 붙은 곳은 상자의 꼭짓점처럼 접히지 않아요. 면 하나를 옮겨 보세요.",
    "hint": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요.",
    "concept": "가능 여부와 이유 구별",
    "id": "N054",
    "chapter": "valid",
    "contentVersion": "96-v1",
    "signature": "valid:one:1,1,1:[[\"0,0\",\"0,1\",\"0,2\",\"0,3\",\"1,1\",\"1,2\"],[]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "스스로",
    "misconceptions": [
      "여섯 면이면 항상 가능"
    ],
    "paper": {
      "page": 55,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          0,
          2
        ],
        [
          0,
          3
        ],
        [
          1,
          1
        ],
        [
          1,
          2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": false
    },
    "foldSequence": null,
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        0,
        2
      ],
      [
        0,
        3
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "valid",
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "title": "이 종이를 접으면 어떻게 될까?",
    "instruction": "상자가 되는지, 안 된다면 왜 그런지 골라요.",
    "options": [
      {
        "id": "valid",
        "label": "겹치지 않고 상자가 돼요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "overlap",
        "label": "면이 겹쳐서 상자가 안 돼요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "cycle",
        "label": "네 면이 둘러 붙어 접을 수 없어요",
        "feedback": "네 면이 둘러 붙은 곳은 상자의 꼭짓점처럼 접히지 않아요. 면 하나를 옮겨 보세요."
      },
      {
        "id": "count",
        "label": "상자를 닫을 면이 부족해요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      }
    ],
    "answers": [
      "cycle"
    ],
    "explanation": "네 면이 둘러 붙은 곳은 상자의 꼭짓점처럼 접히지 않아요. 면 하나를 옮겨 보세요.",
    "hint": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요.",
    "concept": "가능 여부와 이유 구별",
    "id": "N055",
    "chapter": "valid",
    "contentVersion": "96-v1",
    "signature": "valid:one:1,1,1:[[\"0,0\",\"0,1\",\"1,0\",\"1,1\",\"1,2\",\"2,1\"],[]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "스스로",
    "misconceptions": [
      "여섯 면이면 항상 가능"
    ],
    "paper": {
      "page": 56,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          1,
          2
        ],
        [
          2,
          1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": false
    },
    "foldSequence": null,
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        0
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "valid",
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "title": "이 종이를 접으면 어떻게 될까?",
    "instruction": "상자가 되는지, 안 된다면 왜 그런지 골라요.",
    "options": [
      {
        "id": "valid",
        "label": "겹치지 않고 상자가 돼요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "overlap",
        "label": "면이 겹쳐서 상자가 안 돼요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "cycle",
        "label": "네 면이 둘러 붙어 접을 수 없어요",
        "feedback": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요."
      },
      {
        "id": "count",
        "label": "상자를 닫을 면이 부족해요",
        "feedback": "면이 5개예요. 상자를 닫으려면 6개의 면이 필요해요."
      }
    ],
    "answers": [
      "count"
    ],
    "explanation": "면이 5개예요. 상자를 닫으려면 6개의 면이 필요해요.",
    "hint": "면의 수, 네 면이 둘러 붙은 곳, 같은 자리를 덮는 면을 차례로 살펴봐요.",
    "concept": "가능 여부와 이유 구별",
    "id": "N056",
    "chapter": "valid",
    "contentVersion": "96-v1",
    "signature": "valid:one:1,1,1:[[\"0,0\",\"0,1\",\"0,2\",\"0,3\",\"1,1\"],[]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "스스로",
    "misconceptions": [
      "여섯 면이면 항상 가능"
    ],
    "paper": {
      "page": 57,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          2,
          0
        ],
        [
          3,
          0
        ],
        [
          1,
          1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": false
    },
    "foldSequence": [
      0,
      1,
      2,
      3
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        2,
        0
      ],
      [
        3,
        0
      ],
      [
        1,
        1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N057",
    "type": "complete",
    "labels": [
      "다",
      "나",
      "가",
      "바",
      "마",
      "라"
    ],
    "answers": [
      "-1,2",
      "-1,1",
      "3,1",
      "-1,0"
    ],
    "options": [
      {
        "id": "0,3",
        "label": "1",
        "cell": [
          0,
          3
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "-1,2",
        "label": "2",
        "cell": [
          -1,
          2
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "1,2",
        "label": "3",
        "cell": [
          1,
          2
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "2,2",
        "label": "4",
        "cell": [
          2,
          2
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "-1,1",
        "label": "5",
        "cell": [
          -1,
          1
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "3,1",
        "label": "6",
        "cell": [
          3,
          1
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "-1,0",
        "label": "7",
        "cell": [
          -1,
          0
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "1,0",
        "label": "8",
        "cell": [
          1,
          0
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "2,0",
        "label": "9",
        "cell": [
          2,
          0
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "0,-1",
        "label": "10",
        "cell": [
          0,
          -1
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      }
    ],
    "target": null,
    "title": "한 면을 어디에 붙이면 상자가 될까?",
    "instruction": "점선으로 표시한 빈칸을 하나 고르세요. 답이 여럿일 수 있어요.",
    "explanation": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요.",
    "hint": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요.",
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        0,
        2
      ],
      [
        1,
        1
      ],
      [
        2,
        1
      ]
    ],
    "chapter": "complete",
    "contentVersion": "96-v1",
    "signature": "complete:one:1,1,1:[[\"0,0\",\"0,1\",\"0,2\",\"1,1\",\"2,1\"],[]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "하나만 찾고, 가능한 자리도 모두 찾아요.",
    "difficulty": "함께",
    "misconceptions": [
      "가능한 자리를 하나로 단정"
    ],
    "paper": {
      "page": 58,
      "kind": "example",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          0,
          2
        ],
        [
          1,
          1
        ],
        [
          2,
          1
        ],
        [
          -1,
          2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "다",
        "나",
        "가",
        "바",
        "마",
        "새"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N058",
    "type": "complete",
    "labels": [
      "마",
      "가",
      "바",
      "라",
      "다",
      "나"
    ],
    "answers": [
      "-4,2",
      "-4,1",
      "0,1",
      "0,0"
    ],
    "options": [
      {
        "id": "-3,3",
        "label": "1",
        "cell": [
          -3,
          3
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "-4,2",
        "label": "2",
        "cell": [
          -4,
          2
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "-2,2",
        "label": "3",
        "cell": [
          -2,
          2
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "-1,2",
        "label": "4",
        "cell": [
          -1,
          2
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "-4,1",
        "label": "5",
        "cell": [
          -4,
          1
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "0,1",
        "label": "6",
        "cell": [
          0,
          1
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "-3,0",
        "label": "7",
        "cell": [
          -3,
          0
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "-2,0",
        "label": "8",
        "cell": [
          -2,
          0
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "0,0",
        "label": "9",
        "cell": [
          0,
          0
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "-1,-1",
        "label": "10",
        "cell": [
          -1,
          -1
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      }
    ],
    "target": null,
    "title": "한 면을 어디에 붙이면 상자가 될까?",
    "instruction": "점선으로 표시한 빈칸을 하나 고르세요. 답이 여럿일 수 있어요.",
    "explanation": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요.",
    "hint": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요.",
    "cells": [
      [
        -1,
        0
      ],
      [
        -1,
        1
      ],
      [
        -2,
        1
      ],
      [
        -3,
        1
      ],
      [
        -3,
        2
      ]
    ],
    "chapter": "complete",
    "contentVersion": "96-v1",
    "signature": "complete:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"2,1\",\"2,2\"],[]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "하나만 찾고, 가능한 자리도 모두 찾아요.",
    "difficulty": "함께",
    "misconceptions": [
      "가능한 자리를 하나로 단정"
    ],
    "paper": {
      "page": 59,
      "kind": "example",
      "cells": [
        [
          -1,
          0
        ],
        [
          -1,
          1
        ],
        [
          -2,
          1
        ],
        [
          -3,
          1
        ],
        [
          -3,
          2
        ],
        [
          -4,
          2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "마",
        "가",
        "바",
        "라",
        "다",
        "새"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N059",
    "type": "complete",
    "labels": [
      "바",
      "마",
      "나",
      "라",
      "가",
      "다"
    ],
    "answers": [
      "3,3",
      "3,2",
      "0,0",
      "1,0"
    ],
    "options": [
      {
        "id": "2,4",
        "label": "1",
        "cell": [
          2,
          4
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "1,3",
        "label": "2",
        "cell": [
          1,
          3
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "3,3",
        "label": "3",
        "cell": [
          3,
          3
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "0,2",
        "label": "4",
        "cell": [
          0,
          2
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "3,2",
        "label": "5",
        "cell": [
          3,
          2
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "-1,1",
        "label": "6",
        "cell": [
          -1,
          1
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "2,1",
        "label": "7",
        "cell": [
          2,
          1
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "0,0",
        "label": "8",
        "cell": [
          0,
          0
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "1,0",
        "label": "9",
        "cell": [
          1,
          0
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      }
    ],
    "target": null,
    "title": "한 면을 어디에 붙이면 상자가 될까?",
    "instruction": "점선으로 표시한 빈칸을 하나 고르세요. 답이 여럿일 수 있어요.",
    "explanation": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요.",
    "hint": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요.",
    "cells": [
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        2
      ],
      [
        2,
        3
      ]
    ],
    "chapter": "complete",
    "contentVersion": "96-v1",
    "signature": "complete:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"2,2\"],[]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "하나만 찾고, 가능한 자리도 모두 찾아요.",
    "difficulty": "함께",
    "misconceptions": [
      "가능한 자리를 하나로 단정"
    ],
    "paper": {
      "page": 60,
      "kind": "example",
      "cells": [
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          1,
          2
        ],
        [
          2,
          2
        ],
        [
          2,
          3
        ],
        [
          3,
          3
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "바",
        "마",
        "나",
        "라",
        "가",
        "새"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N060",
    "type": "complete",
    "labels": [
      "다",
      "라",
      "바",
      "마",
      "가",
      "나"
    ],
    "answers": [
      "-2,3",
      "-2,2",
      "-2,1",
      "-2,0"
    ],
    "options": [
      {
        "id": "-1,4",
        "label": "1",
        "cell": [
          -1,
          4
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "-2,3",
        "label": "2",
        "cell": [
          -2,
          3
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "0,3",
        "label": "3",
        "cell": [
          0,
          3
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "-2,2",
        "label": "4",
        "cell": [
          -2,
          2
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "0,2",
        "label": "5",
        "cell": [
          0,
          2
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "-2,1",
        "label": "6",
        "cell": [
          -2,
          1
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "0,1",
        "label": "7",
        "cell": [
          0,
          1
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "-2,0",
        "label": "8",
        "cell": [
          -2,
          0
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "1,0",
        "label": "9",
        "cell": [
          1,
          0
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "-1,-1",
        "label": "10",
        "cell": [
          -1,
          -1
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "0,-1",
        "label": "11",
        "cell": [
          0,
          -1
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      }
    ],
    "target": null,
    "title": "한 면을 어디에 붙이면 상자가 될까?",
    "instruction": "점선으로 표시한 빈칸을 하나 고르세요. 답이 여럿일 수 있어요.",
    "explanation": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요.",
    "hint": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요.",
    "cells": [
      [
        0,
        0
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ],
      [
        -1,
        2
      ],
      [
        -1,
        3
      ]
    ],
    "chapter": "complete",
    "contentVersion": "96-v1",
    "signature": "complete:one:1,1,1:[[\"0,0\",\"0,1\",\"0,2\",\"0,3\",\"1,0\"],[]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "하나만 찾고, 가능한 자리도 모두 찾아요.",
    "difficulty": "함께",
    "misconceptions": [
      "가능한 자리를 하나로 단정"
    ],
    "paper": {
      "page": 61,
      "kind": "example",
      "cells": [
        [
          0,
          0
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ],
        [
          -1,
          2
        ],
        [
          -1,
          3
        ],
        [
          -2,
          3
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "다",
        "라",
        "바",
        "마",
        "가",
        "새"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N061",
    "type": "complete",
    "labels": [
      "마",
      "가",
      "나",
      "다",
      "라",
      "바"
    ],
    "answers": [
      "1,4",
      "3,2",
      "0,0",
      "1,0"
    ],
    "options": [
      {
        "id": "1,4",
        "label": "1",
        "cell": [
          1,
          4
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "0,3",
        "label": "2",
        "cell": [
          0,
          3
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "2,3",
        "label": "3",
        "cell": [
          2,
          3
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "0,2",
        "label": "4",
        "cell": [
          0,
          2
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "3,2",
        "label": "5",
        "cell": [
          3,
          2
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "-1,1",
        "label": "6",
        "cell": [
          -1,
          1
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "2,1",
        "label": "7",
        "cell": [
          2,
          1
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "0,0",
        "label": "8",
        "cell": [
          0,
          0
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "1,0",
        "label": "9",
        "cell": [
          1,
          0
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      }
    ],
    "target": null,
    "title": "한 면을 어디에 붙이면 상자가 될까?",
    "instruction": "점선으로 표시한 빈칸을 하나 고르세요. 답이 여럿일 수 있어요.",
    "explanation": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요.",
    "hint": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요.",
    "cells": [
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        1,
        3
      ],
      [
        2,
        2
      ]
    ],
    "chapter": "complete",
    "contentVersion": "96-v1",
    "signature": "complete:one:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"2,1\"],[]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "하나만 찾고, 가능한 자리도 모두 찾아요.",
    "difficulty": "스스로",
    "misconceptions": [
      "가능한 자리를 하나로 단정"
    ],
    "paper": {
      "page": 62,
      "kind": "example",
      "cells": [
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          1,
          2
        ],
        [
          1,
          3
        ],
        [
          2,
          2
        ],
        [
          1,
          4
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "마",
        "가",
        "나",
        "다",
        "라",
        "새"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N062",
    "type": "complete",
    "labels": [
      "가",
      "마",
      "바",
      "다",
      "라",
      "나"
    ],
    "answers": [
      "0,0",
      "0,-1",
      "0,-2",
      "0,-3"
    ],
    "options": [
      {
        "id": "-1,1",
        "label": "1",
        "cell": [
          -1,
          1
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "-2,0",
        "label": "2",
        "cell": [
          -2,
          0
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "0,0",
        "label": "3",
        "cell": [
          0,
          0
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "-2,-1",
        "label": "4",
        "cell": [
          -2,
          -1
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "0,-1",
        "label": "5",
        "cell": [
          0,
          -1
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "-3,-2",
        "label": "6",
        "cell": [
          -3,
          -2
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "0,-2",
        "label": "7",
        "cell": [
          0,
          -2
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "-2,-3",
        "label": "8",
        "cell": [
          -2,
          -3
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "0,-3",
        "label": "9",
        "cell": [
          0,
          -3
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "-1,-4",
        "label": "10",
        "cell": [
          -1,
          -4
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      }
    ],
    "target": null,
    "title": "한 면을 어디에 붙이면 상자가 될까?",
    "instruction": "점선으로 표시한 빈칸을 하나 고르세요. 답이 여럿일 수 있어요.",
    "explanation": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요.",
    "hint": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요.",
    "cells": [
      [
        -1,
        0
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        -2
      ],
      [
        -1,
        -3
      ],
      [
        -2,
        -2
      ]
    ],
    "chapter": "complete",
    "contentVersion": "96-v1",
    "signature": "complete:one:1,1,1:[[\"0,0\",\"0,1\",\"0,2\",\"0,3\",\"1,1\"],[]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "하나만 찾고, 가능한 자리도 모두 찾아요.",
    "difficulty": "스스로",
    "misconceptions": [
      "가능한 자리를 하나로 단정"
    ],
    "paper": {
      "page": 63,
      "kind": "example",
      "cells": [
        [
          -1,
          0
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          -2
        ],
        [
          -1,
          -3
        ],
        [
          -2,
          -2
        ],
        [
          0,
          0
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "마",
        "바",
        "다",
        "라",
        "새"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "complete",
    "labels": [
      "다",
      "나",
      "가",
      "바",
      "마",
      "라"
    ],
    "answers": [
      "-1,2",
      "-1,1",
      "3,1",
      "-1,0"
    ],
    "options": [
      {
        "id": "0,3",
        "label": "1",
        "cell": [
          0,
          3
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "-1,2",
        "label": "2",
        "cell": [
          -1,
          2
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "1,2",
        "label": "3",
        "cell": [
          1,
          2
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "2,2",
        "label": "4",
        "cell": [
          2,
          2
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "-1,1",
        "label": "5",
        "cell": [
          -1,
          1
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "3,1",
        "label": "6",
        "cell": [
          3,
          1
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "-1,0",
        "label": "7",
        "cell": [
          -1,
          0
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "1,0",
        "label": "8",
        "cell": [
          1,
          0
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "2,0",
        "label": "9",
        "cell": [
          2,
          0
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "0,-1",
        "label": "10",
        "cell": [
          0,
          -1
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      }
    ],
    "target": null,
    "title": "한 면을 붙일 수 있는 자리를 모두 찾아요",
    "instruction": "각 자리에 한 면씩 붙여 본다고 생각해요. 가능한 자리를 모두 누르고 확인해요.",
    "explanation": "한 면을 붙일 수 있는 자리는 4곳이에요. 여러 자리에 동시에 붙이는 것이 아니라, 각 자리에 하나씩 붙여 보는 서로 다른 방법이에요.",
    "hint": "먼저 가능한 자리 하나를 찾고, 다른 자리에서도 빈 곳을 막을 수 있는지 살펴봐요.",
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        0,
        2
      ],
      [
        1,
        1
      ],
      [
        2,
        1
      ]
    ],
    "chapter": "complete",
    "contentVersion": "96-v1",
    "signature": "complete:all:1,1,1:[[\"0,0\",\"0,1\",\"0,2\",\"1,1\",\"2,1\"],[]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "하나만 찾고, 가능한 자리도 모두 찾아요.",
    "difficulty": "스스로",
    "misconceptions": [
      "가능한 자리를 하나로 단정"
    ],
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "answerMode": "all",
    "id": "N063",
    "paper": {
      "page": 64,
      "kind": "example",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          0,
          2
        ],
        [
          1,
          1
        ],
        [
          2,
          1
        ],
        [
          -1,
          2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "다",
        "나",
        "가",
        "바",
        "마",
        "새"
      ],
      "closed": true
    },
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "complete",
    "labels": [
      "마",
      "가",
      "바",
      "라",
      "다",
      "나"
    ],
    "answers": [
      "-4,2",
      "-4,1",
      "0,1",
      "0,0"
    ],
    "options": [
      {
        "id": "-3,3",
        "label": "1",
        "cell": [
          -3,
          3
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "-4,2",
        "label": "2",
        "cell": [
          -4,
          2
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "-2,2",
        "label": "3",
        "cell": [
          -2,
          2
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "-1,2",
        "label": "4",
        "cell": [
          -1,
          2
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "-4,1",
        "label": "5",
        "cell": [
          -4,
          1
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "0,1",
        "label": "6",
        "cell": [
          0,
          1
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "-3,0",
        "label": "7",
        "cell": [
          -3,
          0
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "-2,0",
        "label": "8",
        "cell": [
          -2,
          0
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "0,0",
        "label": "9",
        "cell": [
          0,
          0
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "-1,-1",
        "label": "10",
        "cell": [
          -1,
          -1
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      }
    ],
    "target": null,
    "title": "한 면을 붙일 수 있는 자리를 모두 찾아요",
    "instruction": "각 자리에 한 면씩 붙여 본다고 생각해요. 가능한 자리를 모두 누르고 확인해요.",
    "explanation": "한 면을 붙일 수 있는 자리는 4곳이에요. 여러 자리에 동시에 붙이는 것이 아니라, 각 자리에 하나씩 붙여 보는 서로 다른 방법이에요.",
    "hint": "먼저 가능한 자리 하나를 찾고, 다른 자리에서도 빈 곳을 막을 수 있는지 살펴봐요.",
    "cells": [
      [
        -1,
        0
      ],
      [
        -1,
        1
      ],
      [
        -2,
        1
      ],
      [
        -3,
        1
      ],
      [
        -3,
        2
      ]
    ],
    "chapter": "complete",
    "contentVersion": "96-v1",
    "signature": "complete:all:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"2,1\",\"2,2\"],[]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "하나만 찾고, 가능한 자리도 모두 찾아요.",
    "difficulty": "스스로",
    "misconceptions": [
      "가능한 자리를 하나로 단정"
    ],
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "answerMode": "all",
    "id": "N064",
    "paper": {
      "page": 65,
      "kind": "example",
      "cells": [
        [
          -1,
          0
        ],
        [
          -1,
          1
        ],
        [
          -2,
          1
        ],
        [
          -3,
          1
        ],
        [
          -3,
          2
        ],
        [
          -4,
          2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "마",
        "가",
        "바",
        "라",
        "다",
        "새"
      ],
      "closed": true
    },
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "complete",
    "labels": [
      "바",
      "마",
      "나",
      "라",
      "가",
      "다"
    ],
    "answers": [
      "3,3",
      "3,2",
      "0,0",
      "1,0"
    ],
    "options": [
      {
        "id": "2,4",
        "label": "1",
        "cell": [
          2,
          4
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "1,3",
        "label": "2",
        "cell": [
          1,
          3
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "3,3",
        "label": "3",
        "cell": [
          3,
          3
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "0,2",
        "label": "4",
        "cell": [
          0,
          2
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "3,2",
        "label": "5",
        "cell": [
          3,
          2
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "-1,1",
        "label": "6",
        "cell": [
          -1,
          1
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "2,1",
        "label": "7",
        "cell": [
          2,
          1
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "0,0",
        "label": "8",
        "cell": [
          0,
          0
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "1,0",
        "label": "9",
        "cell": [
          1,
          0
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      }
    ],
    "target": null,
    "title": "한 면을 붙일 수 있는 자리를 모두 찾아요",
    "instruction": "각 자리에 한 면씩 붙여 본다고 생각해요. 가능한 자리를 모두 누르고 확인해요.",
    "explanation": "한 면을 붙일 수 있는 자리는 4곳이에요. 여러 자리에 동시에 붙이는 것이 아니라, 각 자리에 하나씩 붙여 보는 서로 다른 방법이에요.",
    "hint": "먼저 가능한 자리 하나를 찾고, 다른 자리에서도 빈 곳을 막을 수 있는지 살펴봐요.",
    "cells": [
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        2
      ],
      [
        2,
        3
      ]
    ],
    "chapter": "complete",
    "contentVersion": "96-v1",
    "signature": "complete:all:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"2,2\"],[]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "하나만 찾고, 가능한 자리도 모두 찾아요.",
    "difficulty": "스스로",
    "misconceptions": [
      "가능한 자리를 하나로 단정"
    ],
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "answerMode": "all",
    "id": "N065",
    "paper": {
      "page": 66,
      "kind": "example",
      "cells": [
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          1,
          2
        ],
        [
          2,
          2
        ],
        [
          2,
          3
        ],
        [
          3,
          3
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "바",
        "마",
        "나",
        "라",
        "가",
        "새"
      ],
      "closed": true
    },
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "complete",
    "labels": [
      "다",
      "라",
      "바",
      "마",
      "가",
      "나"
    ],
    "answers": [
      "-2,3",
      "-2,2",
      "-2,1",
      "-2,0"
    ],
    "options": [
      {
        "id": "-1,4",
        "label": "1",
        "cell": [
          -1,
          4
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "-2,3",
        "label": "2",
        "cell": [
          -2,
          3
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "0,3",
        "label": "3",
        "cell": [
          0,
          3
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "-2,2",
        "label": "4",
        "cell": [
          -2,
          2
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "0,2",
        "label": "5",
        "cell": [
          0,
          2
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "-2,1",
        "label": "6",
        "cell": [
          -2,
          1
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "0,1",
        "label": "7",
        "cell": [
          0,
          1
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "-2,0",
        "label": "8",
        "cell": [
          -2,
          0
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "1,0",
        "label": "9",
        "cell": [
          1,
          0
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "-1,-1",
        "label": "10",
        "cell": [
          -1,
          -1
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "0,-1",
        "label": "11",
        "cell": [
          0,
          -1
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      }
    ],
    "target": null,
    "title": "한 면을 붙일 수 있는 자리를 모두 찾아요",
    "instruction": "각 자리에 한 면씩 붙여 본다고 생각해요. 가능한 자리를 모두 누르고 확인해요.",
    "explanation": "한 면을 붙일 수 있는 자리는 4곳이에요. 여러 자리에 동시에 붙이는 것이 아니라, 각 자리에 하나씩 붙여 보는 서로 다른 방법이에요.",
    "hint": "먼저 가능한 자리 하나를 찾고, 다른 자리에서도 빈 곳을 막을 수 있는지 살펴봐요.",
    "cells": [
      [
        0,
        0
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ],
      [
        -1,
        2
      ],
      [
        -1,
        3
      ]
    ],
    "chapter": "complete",
    "contentVersion": "96-v1",
    "signature": "complete:all:1,1,1:[[\"0,0\",\"0,1\",\"0,2\",\"0,3\",\"1,0\"],[]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "하나만 찾고, 가능한 자리도 모두 찾아요.",
    "difficulty": "스스로",
    "misconceptions": [
      "가능한 자리를 하나로 단정"
    ],
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "answerMode": "all",
    "id": "N066",
    "paper": {
      "page": 67,
      "kind": "example",
      "cells": [
        [
          0,
          0
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ],
        [
          -1,
          2
        ],
        [
          -1,
          3
        ],
        [
          -2,
          3
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "다",
        "라",
        "바",
        "마",
        "가",
        "새"
      ],
      "closed": true
    },
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "complete",
    "labels": [
      "마",
      "가",
      "나",
      "다",
      "라",
      "바"
    ],
    "answers": [
      "1,4",
      "3,2",
      "0,0",
      "1,0"
    ],
    "options": [
      {
        "id": "1,4",
        "label": "1",
        "cell": [
          1,
          4
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "0,3",
        "label": "2",
        "cell": [
          0,
          3
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "2,3",
        "label": "3",
        "cell": [
          2,
          3
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "0,2",
        "label": "4",
        "cell": [
          0,
          2
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "3,2",
        "label": "5",
        "cell": [
          3,
          2
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "-1,1",
        "label": "6",
        "cell": [
          -1,
          1
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "2,1",
        "label": "7",
        "cell": [
          2,
          1
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "0,0",
        "label": "8",
        "cell": [
          0,
          0
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "1,0",
        "label": "9",
        "cell": [
          1,
          0
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      }
    ],
    "target": null,
    "title": "한 면을 붙일 수 있는 자리를 모두 찾아요",
    "instruction": "각 자리에 한 면씩 붙여 본다고 생각해요. 가능한 자리를 모두 누르고 확인해요.",
    "explanation": "한 면을 붙일 수 있는 자리는 4곳이에요. 여러 자리에 동시에 붙이는 것이 아니라, 각 자리에 하나씩 붙여 보는 서로 다른 방법이에요.",
    "hint": "먼저 가능한 자리 하나를 찾고, 다른 자리에서도 빈 곳을 막을 수 있는지 살펴봐요.",
    "cells": [
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        1,
        3
      ],
      [
        2,
        2
      ]
    ],
    "chapter": "complete",
    "contentVersion": "96-v1",
    "signature": "complete:all:1,1,1:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"2,1\"],[]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "하나만 찾고, 가능한 자리도 모두 찾아요.",
    "difficulty": "스스로",
    "misconceptions": [
      "가능한 자리를 하나로 단정"
    ],
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "answerMode": "all",
    "id": "N067",
    "paper": {
      "page": 68,
      "kind": "example",
      "cells": [
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          1,
          2
        ],
        [
          1,
          3
        ],
        [
          2,
          2
        ],
        [
          1,
          4
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "마",
        "가",
        "나",
        "다",
        "라",
        "새"
      ],
      "closed": true
    },
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "complete",
    "labels": [
      "가",
      "마",
      "바",
      "다",
      "라",
      "나"
    ],
    "answers": [
      "0,0",
      "0,-1",
      "0,-2",
      "0,-3"
    ],
    "options": [
      {
        "id": "-1,1",
        "label": "1",
        "cell": [
          -1,
          1
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "-2,0",
        "label": "2",
        "cell": [
          -2,
          0
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "0,0",
        "label": "3",
        "cell": [
          0,
          0
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "-2,-1",
        "label": "4",
        "cell": [
          -2,
          -1
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "0,-1",
        "label": "5",
        "cell": [
          0,
          -1
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "-3,-2",
        "label": "6",
        "cell": [
          -3,
          -2
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "0,-2",
        "label": "7",
        "cell": [
          0,
          -2
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "-2,-3",
        "label": "8",
        "cell": [
          -2,
          -3
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      },
      {
        "id": "0,-3",
        "label": "9",
        "cell": [
          0,
          -3
        ],
        "feedback": "선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요."
      },
      {
        "id": "-1,-4",
        "label": "10",
        "cell": [
          -1,
          -4
        ],
        "feedback": "이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요."
      }
    ],
    "target": null,
    "title": "한 면을 붙일 수 있는 자리를 모두 찾아요",
    "instruction": "각 자리에 한 면씩 붙여 본다고 생각해요. 가능한 자리를 모두 누르고 확인해요.",
    "explanation": "한 면을 붙일 수 있는 자리는 4곳이에요. 여러 자리에 동시에 붙이는 것이 아니라, 각 자리에 하나씩 붙여 보는 서로 다른 방법이에요.",
    "hint": "먼저 가능한 자리 하나를 찾고, 다른 자리에서도 빈 곳을 막을 수 있는지 살펴봐요.",
    "cells": [
      [
        -1,
        0
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        -2
      ],
      [
        -1,
        -3
      ],
      [
        -2,
        -2
      ]
    ],
    "chapter": "complete",
    "contentVersion": "96-v1",
    "signature": "complete:all:1,1,1:[[\"0,0\",\"0,1\",\"0,2\",\"0,3\",\"1,1\"],[]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "concept": "하나만 찾고, 가능한 자리도 모두 찾아요.",
    "difficulty": "스스로",
    "misconceptions": [
      "가능한 자리를 하나로 단정"
    ],
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "answerMode": "all",
    "id": "N068",
    "paper": {
      "page": 69,
      "kind": "example",
      "cells": [
        [
          -1,
          0
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          -2
        ],
        [
          -1,
          -3
        ],
        [
          -2,
          -2
        ],
        [
          0,
          0
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "마",
        "바",
        "다",
        "라",
        "새"
      ],
      "closed": true
    },
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "id": "N069",
    "type": "length",
    "labels": [
      "라",
      "나",
      "가",
      "마",
      "다",
      "바"
    ],
    "answers": [
      "4"
    ],
    "options": [
      {
        "id": "2",
        "label": "2 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "3",
        "label": "3 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "4",
        "label": "4 cm",
        "feedback": "★ 모서리와 ＝ 표시 모서리는 각각 4 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요."
      },
      {
        "id": "5",
        "label": "5 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      }
    ],
    "target": "1:e0",
    "title": "★ 모서리의 길이는 몇 cm일까?",
    "instruction": "가로 4 cm, 세로 3 cm, 높이 2 cm인 상자예요.",
    "explanation": "★ 모서리와 ＝ 표시 모서리는 각각 4 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요.",
    "hint": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요.",
    "length": 4,
    "concept": "서로 다른 세 길이",
    "chapter": "length",
    "contentVersion": "96-v1",
    "signature": "length:one:2,3,4:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"1,3\",\"2,1\"],[[\"-0.5,0.5\",\"-0.5,1.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "함께",
    "misconceptions": [
      "펼친 방향과 길이 혼동"
    ],
    "paper": {
      "page": 70,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ],
        [
          -2,
          1
        ],
        [
          -3,
          1
        ],
        [
          -1,
          2
        ]
      ],
      "dimensions": [
        4,
        3,
        2
      ],
      "labels": [
        "라",
        "나",
        "가",
        "마",
        "다",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ],
      [
        -2,
        1
      ],
      [
        -3,
        1
      ],
      [
        -1,
        2
      ]
    ],
    "dimensions": [
      4,
      3,
      2
    ]
  },
  {
    "id": "N070",
    "type": "length",
    "labels": [
      "다",
      "바",
      "마",
      "나",
      "라",
      "가"
    ],
    "answers": [
      "5"
    ],
    "options": [
      {
        "id": "2",
        "label": "2 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "3",
        "label": "3 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "5",
        "label": "5 cm",
        "feedback": "★ 모서리와 ＝ 표시 모서리는 각각 5 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요."
      },
      {
        "id": "6",
        "label": "6 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      }
    ],
    "target": "0:e3",
    "title": "★ 모서리의 길이는 몇 cm일까?",
    "instruction": "가로 5 cm, 세로 3 cm, 높이 2 cm인 상자예요.",
    "explanation": "★ 모서리와 ＝ 표시 모서리는 각각 5 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요.",
    "hint": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요.",
    "length": 5,
    "concept": "서로 다른 세 길이",
    "chapter": "length",
    "contentVersion": "96-v1",
    "signature": "length:one:2,3,5:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"1,3\",\"2,2\"],[[\"-0.5,-0.5\",\"0.5,-0.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "함께",
    "misconceptions": [
      "펼친 방향과 길이 혼동"
    ],
    "paper": {
      "page": 71,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          -1
        ],
        [
          2,
          -1
        ],
        [
          3,
          -1
        ],
        [
          2,
          -2
        ]
      ],
      "dimensions": [
        5,
        3,
        2
      ],
      "labels": [
        "다",
        "바",
        "마",
        "나",
        "라",
        "가"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        1,
        -1
      ],
      [
        2,
        -1
      ],
      [
        3,
        -1
      ],
      [
        2,
        -2
      ]
    ],
    "dimensions": [
      5,
      3,
      2
    ]
  },
  {
    "id": "N071",
    "type": "length",
    "labels": [
      "가",
      "다",
      "라",
      "바",
      "나",
      "마"
    ],
    "answers": [
      "3"
    ],
    "options": [
      {
        "id": "2",
        "label": "2 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "3",
        "label": "3 cm",
        "feedback": "★ 모서리와 ＝ 표시 모서리는 각각 3 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요."
      },
      {
        "id": "4",
        "label": "4 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "5",
        "label": "5 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      }
    ],
    "target": "5:e3",
    "title": "★ 모서리의 길이는 몇 cm일까?",
    "instruction": "가로 4 cm, 세로 2 cm, 높이 3 cm인 상자예요.",
    "explanation": "★ 모서리와 ＝ 표시 모서리는 각각 3 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요.",
    "hint": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요.",
    "length": 3,
    "concept": "서로 다른 세 길이",
    "chapter": "length",
    "contentVersion": "96-v1",
    "signature": "length:one:2,3,4:[[\"0,0\",\"0,1\",\"0,2\",\"1,2\",\"1,3\",\"1,4\"],[[\"0.5,-0.5\",\"0.5,0.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "함께",
    "misconceptions": [
      "펼친 방향과 길이 혼동"
    ],
    "paper": {
      "page": 72,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          0,
          2
        ],
        [
          1,
          2
        ],
        [
          1,
          3
        ],
        [
          1,
          4
        ]
      ],
      "dimensions": [
        4,
        2,
        3
      ],
      "labels": [
        "가",
        "다",
        "라",
        "바",
        "나",
        "마"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        0,
        2
      ],
      [
        1,
        2
      ],
      [
        1,
        3
      ],
      [
        1,
        4
      ]
    ],
    "dimensions": [
      4,
      2,
      3
    ]
  },
  {
    "id": "N072",
    "type": "length",
    "labels": [
      "마",
      "라",
      "나",
      "바",
      "가",
      "다"
    ],
    "answers": [
      "2"
    ],
    "options": [
      {
        "id": "2",
        "label": "2 cm",
        "feedback": "★ 모서리와 ＝ 표시 모서리는 각각 2 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요."
      },
      {
        "id": "3",
        "label": "3 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "4",
        "label": "4 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "9",
        "label": "9 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      }
    ],
    "target": "1:e3",
    "title": "★ 모서리의 길이는 몇 cm일까?",
    "instruction": "가로 3 cm, 세로 2 cm, 높이 4 cm인 상자예요.",
    "explanation": "★ 모서리와 ＝ 표시 모서리는 각각 2 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요.",
    "hint": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요.",
    "length": 2,
    "concept": "서로 다른 세 길이",
    "chapter": "length",
    "contentVersion": "96-v1",
    "signature": "length:one:2,3,4:[[\"0,0\",\"0,1\",\"1,1\",\"2,1\",\"2,2\",\"3,1\"],[[\"-0.5,0.5\",\"-0.5,1.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "함께",
    "misconceptions": [
      "펼친 방향과 길이 혼동"
    ],
    "paper": {
      "page": 73,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          2,
          1
        ],
        [
          2,
          2
        ],
        [
          3,
          1
        ]
      ],
      "dimensions": [
        3,
        2,
        4
      ],
      "labels": [
        "마",
        "라",
        "나",
        "바",
        "가",
        "다"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        2,
        1
      ],
      [
        2,
        2
      ],
      [
        3,
        1
      ]
    ],
    "dimensions": [
      3,
      2,
      4
    ]
  },
  {
    "id": "N073",
    "type": "length",
    "labels": [
      "라",
      "다",
      "가",
      "나",
      "바",
      "마"
    ],
    "answers": [
      "5"
    ],
    "options": [
      {
        "id": "2",
        "label": "2 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "3",
        "label": "3 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "5",
        "label": "5 cm",
        "feedback": "★ 모서리와 ＝ 표시 모서리는 각각 5 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요."
      },
      {
        "id": "6",
        "label": "6 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      }
    ],
    "target": "5:e1",
    "title": "★ 모서리의 길이는 몇 cm일까?",
    "instruction": "가로 5 cm, 세로 2 cm, 높이 3 cm인 상자예요.",
    "explanation": "★ 모서리와 ＝ 표시 모서리는 각각 5 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요.",
    "hint": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요.",
    "length": 5,
    "concept": "서로 다른 세 길이",
    "chapter": "length",
    "contentVersion": "96-v1",
    "signature": "length:one:2,3,5:[[\"0,1\",\"1,0\",\"1,1\",\"1,2\",\"1,3\",\"2,2\"],[[\"-0.5,0.5\",\"0.5,0.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "스스로",
    "misconceptions": [
      "펼친 방향과 길이 혼동"
    ],
    "paper": {
      "page": 74,
      "kind": "task",
      "cells": [
        [
          1,
          0
        ],
        [
          0,
          -1
        ],
        [
          1,
          -1
        ],
        [
          2,
          -1
        ],
        [
          3,
          -1
        ],
        [
          2,
          -2
        ]
      ],
      "dimensions": [
        5,
        2,
        3
      ],
      "labels": [
        "라",
        "다",
        "가",
        "나",
        "바",
        "마"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        1,
        0
      ],
      [
        0,
        -1
      ],
      [
        1,
        -1
      ],
      [
        2,
        -1
      ],
      [
        3,
        -1
      ],
      [
        2,
        -2
      ]
    ],
    "dimensions": [
      5,
      2,
      3
    ]
  },
  {
    "id": "N074",
    "type": "length",
    "labels": [
      "다",
      "라",
      "가",
      "나",
      "마",
      "바"
    ],
    "answers": [
      "4"
    ],
    "options": [
      {
        "id": "2",
        "label": "2 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "3",
        "label": "3 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "4",
        "label": "4 cm",
        "feedback": "★ 모서리와 ＝ 표시 모서리는 각각 4 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요."
      },
      {
        "id": "5",
        "label": "5 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      }
    ],
    "target": "1:e3",
    "title": "★ 모서리의 길이는 몇 cm일까?",
    "instruction": "가로 3 cm, 세로 4 cm, 높이 2 cm인 상자예요.",
    "explanation": "★ 모서리와 ＝ 표시 모서리는 각각 4 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요.",
    "hint": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요.",
    "length": 4,
    "concept": "서로 다른 세 길이",
    "chapter": "length",
    "contentVersion": "96-v1",
    "signature": "length:one:2,3,4:[[\"0,1\",\"1,0\",\"1,1\",\"1,2\",\"1,3\",\"2,2\"],[[\"0.5,-0.5\",\"1.5,-0.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "스스로",
    "misconceptions": [
      "펼친 방향과 길이 혼동"
    ],
    "paper": {
      "page": 75,
      "kind": "task",
      "cells": [
        [
          1,
          0
        ],
        [
          0,
          -1
        ],
        [
          1,
          -1
        ],
        [
          2,
          -1
        ],
        [
          3,
          -1
        ],
        [
          2,
          -2
        ]
      ],
      "dimensions": [
        3,
        4,
        2
      ],
      "labels": [
        "다",
        "라",
        "가",
        "나",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        1,
        0
      ],
      [
        0,
        -1
      ],
      [
        1,
        -1
      ],
      [
        2,
        -1
      ],
      [
        3,
        -1
      ],
      [
        2,
        -2
      ]
    ],
    "dimensions": [
      3,
      4,
      2
    ]
  },
  {
    "id": "N075",
    "type": "length",
    "labels": [
      "라",
      "나",
      "다",
      "가",
      "바",
      "마"
    ],
    "answers": [
      "2"
    ],
    "options": [
      {
        "id": "2",
        "label": "2 cm",
        "feedback": "★ 모서리와 ＝ 표시 모서리는 각각 2 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요."
      },
      {
        "id": "3",
        "label": "3 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "4",
        "label": "4 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "9",
        "label": "9 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      }
    ],
    "target": "3:e1",
    "title": "★ 모서리의 길이는 몇 cm일까?",
    "instruction": "가로 4 cm, 세로 3 cm, 높이 2 cm인 상자예요.",
    "explanation": "★ 모서리와 ＝ 표시 모서리는 각각 2 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요.",
    "hint": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요.",
    "length": 2,
    "concept": "서로 다른 세 길이",
    "chapter": "length",
    "contentVersion": "96-v1",
    "signature": "length:one:2,3,4:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"2,2\",\"2,3\"],[[\"0.5,0.5\",\"1.5,0.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "스스로",
    "misconceptions": [
      "펼친 방향과 길이 혼동"
    ],
    "paper": {
      "page": 76,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          -1
        ],
        [
          2,
          -1
        ],
        [
          2,
          -2
        ],
        [
          3,
          -2
        ]
      ],
      "dimensions": [
        4,
        3,
        2
      ],
      "labels": [
        "라",
        "나",
        "다",
        "가",
        "바",
        "마"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        1,
        -1
      ],
      [
        2,
        -1
      ],
      [
        2,
        -2
      ],
      [
        3,
        -2
      ]
    ],
    "dimensions": [
      4,
      3,
      2
    ]
  },
  {
    "id": "N076",
    "type": "length",
    "labels": [
      "라",
      "바",
      "마",
      "나",
      "다",
      "가"
    ],
    "answers": [
      "3"
    ],
    "options": [
      {
        "id": "2",
        "label": "2 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "3",
        "label": "3 cm",
        "feedback": "★ 모서리와 ＝ 표시 모서리는 각각 3 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요."
      },
      {
        "id": "4",
        "label": "4 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "5",
        "label": "5 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      }
    ],
    "target": "2:e1",
    "title": "★ 모서리의 길이는 몇 cm일까?",
    "instruction": "가로 5 cm, 세로 3 cm, 높이 2 cm인 상자예요.",
    "explanation": "★ 모서리와 ＝ 표시 모서리는 각각 3 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요.",
    "hint": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요.",
    "length": 3,
    "concept": "서로 다른 세 길이",
    "chapter": "length",
    "contentVersion": "96-v1",
    "signature": "length:one:2,3,5:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"2,2\",\"2,3\"],[[\"0.5,1.5\",\"0.5,2.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "스스로",
    "misconceptions": [
      "펼친 방향과 길이 혼동"
    ],
    "paper": {
      "page": 77,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          1,
          2
        ],
        [
          2,
          2
        ],
        [
          2,
          3
        ]
      ],
      "dimensions": [
        5,
        3,
        2
      ],
      "labels": [
        "라",
        "바",
        "마",
        "나",
        "다",
        "가"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        2
      ],
      [
        2,
        3
      ]
    ],
    "dimensions": [
      5,
      3,
      2
    ]
  },
  {
    "id": "N077",
    "type": "length",
    "labels": [
      "가",
      "마",
      "나",
      "바",
      "라",
      "다"
    ],
    "answers": [
      "4"
    ],
    "options": [
      {
        "id": "2",
        "label": "2 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "4",
        "label": "4 cm",
        "feedback": "★ 모서리와 ＝ 표시 모서리는 각각 4 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요."
      },
      {
        "id": "5",
        "label": "5 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "6",
        "label": "6 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      }
    ],
    "target": "0:e0",
    "title": "★ 모서리의 길이는 몇 cm일까?",
    "instruction": "가로 4 cm, 세로 4 cm, 높이 2 cm인 상자예요.",
    "explanation": "★ 모서리와 ＝ 표시 모서리는 각각 4 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요.",
    "hint": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요.",
    "length": 4,
    "concept": "두 길이가 같은 직육면체",
    "chapter": "length",
    "contentVersion": "96-v1",
    "signature": "length:one:2,4,4:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"1,3\",\"2,2\"],[[\"0.5,-0.5\",\"0.5,0.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "스스로",
    "misconceptions": [
      "펼친 방향과 길이 혼동"
    ],
    "paper": {
      "page": 78,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          -1
        ],
        [
          2,
          -1
        ],
        [
          3,
          -1
        ],
        [
          2,
          -2
        ]
      ],
      "dimensions": [
        4,
        4,
        2
      ],
      "labels": [
        "가",
        "마",
        "나",
        "바",
        "라",
        "다"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        1,
        -1
      ],
      [
        2,
        -1
      ],
      [
        3,
        -1
      ],
      [
        2,
        -2
      ]
    ],
    "dimensions": [
      4,
      4,
      2
    ]
  },
  {
    "id": "N078",
    "type": "length",
    "labels": [
      "가",
      "라",
      "다",
      "바",
      "마",
      "나"
    ],
    "answers": [
      "3"
    ],
    "options": [
      {
        "id": "2",
        "label": "2 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "3",
        "label": "3 cm",
        "feedback": "★ 모서리와 ＝ 표시 모서리는 각각 3 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요."
      },
      {
        "id": "4",
        "label": "4 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "5",
        "label": "5 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      }
    ],
    "target": "1:e0",
    "title": "★ 모서리의 길이는 몇 cm일까?",
    "instruction": "가로 3 cm, 세로 3 cm, 높이 2 cm인 상자예요.",
    "explanation": "★ 모서리와 ＝ 표시 모서리는 각각 3 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요.",
    "hint": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요.",
    "length": 3,
    "concept": "두 길이가 같은 직육면체",
    "chapter": "length",
    "contentVersion": "96-v1",
    "signature": "length:one:2,3,3:[[\"0,1\",\"1,0\",\"1,1\",\"1,2\",\"1,3\",\"2,1\"],[[\"0.5,-0.5\",\"1.5,-0.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "스스로",
    "misconceptions": [
      "펼친 방향과 길이 혼동"
    ],
    "paper": {
      "page": 79,
      "kind": "task",
      "cells": [
        [
          0,
          1
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          1,
          2
        ],
        [
          1,
          3
        ],
        [
          2,
          1
        ]
      ],
      "dimensions": [
        3,
        3,
        2
      ],
      "labels": [
        "가",
        "라",
        "다",
        "바",
        "마",
        "나"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        1
      ],
      [
        1,
        0
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        1,
        3
      ],
      [
        2,
        1
      ]
    ],
    "dimensions": [
      3,
      3,
      2
    ]
  },
  {
    "id": "N079",
    "type": "length",
    "labels": [
      "바",
      "라",
      "다",
      "가",
      "나",
      "마"
    ],
    "answers": [
      "4"
    ],
    "options": [
      {
        "id": "2",
        "label": "2 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "4",
        "label": "4 cm",
        "feedback": "★ 모서리와 ＝ 표시 모서리는 각각 4 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요."
      },
      {
        "id": "5",
        "label": "5 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "6",
        "label": "6 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      }
    ],
    "target": "0:e1",
    "title": "★ 모서리의 길이는 몇 cm일까?",
    "instruction": "가로 4 cm, 세로 2 cm, 높이 4 cm인 상자예요.",
    "explanation": "★ 모서리와 ＝ 표시 모서리는 각각 4 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요.",
    "hint": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요.",
    "length": 4,
    "concept": "두 길이가 같은 직육면체",
    "chapter": "length",
    "contentVersion": "96-v1",
    "signature": "length:one:2,4,4:[[\"0,0\",\"0,1\",\"1,1\",\"2,1\",\"3,1\",\"3,2\"],[[\"0.5,-0.5\",\"0.5,0.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "스스로",
    "misconceptions": [
      "펼친 방향과 길이 혼동"
    ],
    "paper": {
      "page": 80,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          2,
          1
        ],
        [
          3,
          1
        ],
        [
          3,
          2
        ]
      ],
      "dimensions": [
        4,
        2,
        4
      ],
      "labels": [
        "바",
        "라",
        "다",
        "가",
        "나",
        "마"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        2,
        1
      ],
      [
        3,
        1
      ],
      [
        3,
        2
      ]
    ],
    "dimensions": [
      4,
      2,
      4
    ]
  },
  {
    "id": "N080",
    "type": "length",
    "labels": [
      "다",
      "라",
      "가",
      "바",
      "마",
      "나"
    ],
    "answers": [
      "4"
    ],
    "options": [
      {
        "id": "2",
        "label": "2 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "4",
        "label": "4 cm",
        "feedback": "★ 모서리와 ＝ 표시 모서리는 각각 4 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요."
      },
      {
        "id": "5",
        "label": "5 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "6",
        "label": "6 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      }
    ],
    "target": "3:e2",
    "title": "★ 모서리의 길이는 몇 cm일까?",
    "instruction": "가로 2 cm, 세로 4 cm, 높이 4 cm인 상자예요.",
    "explanation": "★ 모서리와 ＝ 표시 모서리는 각각 4 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요.",
    "hint": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요.",
    "length": 4,
    "concept": "두 길이가 같은 직육면체",
    "chapter": "length",
    "contentVersion": "96-v1",
    "signature": "length:one:2,4,4:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"2,2\",\"2,3\"],[[\"0.5,0.5\",\"1.5,0.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "스스로",
    "misconceptions": [
      "펼친 방향과 길이 혼동"
    ],
    "paper": {
      "page": 81,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          1,
          2
        ],
        [
          2,
          2
        ],
        [
          2,
          3
        ]
      ],
      "dimensions": [
        2,
        4,
        4
      ],
      "labels": [
        "다",
        "라",
        "가",
        "바",
        "마",
        "나"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        2
      ],
      [
        2,
        3
      ]
    ],
    "dimensions": [
      2,
      4,
      4
    ]
  },
  {
    "id": "N081",
    "type": "length",
    "labels": [
      "가",
      "마",
      "나",
      "다",
      "라",
      "바"
    ],
    "answers": [
      "3"
    ],
    "options": [
      {
        "id": "3",
        "label": "3 cm",
        "feedback": "★ 모서리와 ＝ 표시 모서리는 각각 3 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요."
      },
      {
        "id": "4",
        "label": "4 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "5",
        "label": "5 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "9",
        "label": "9 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      }
    ],
    "target": "2:e2",
    "title": "세 길이가 같은 상자의 ★ 길이는?",
    "instruction": "가로 3 cm, 세로 3 cm, 높이 3 cm인 상자예요.",
    "explanation": "★ 모서리와 ＝ 표시 모서리는 각각 3 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요.",
    "hint": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요.",
    "length": 3,
    "concept": "정육면체 길이 전이",
    "chapter": "length",
    "contentVersion": "96-v1",
    "signature": "length:one:3,3,3:[[\"0,0\",\"0,1\",\"0,2\",\"1,2\",\"1,3\",\"1,4\"],[[\"-0.5,2.5\",\"0.5,2.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "스스로",
    "misconceptions": [
      "펼친 방향과 길이 혼동"
    ],
    "paper": {
      "page": 82,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          0,
          2
        ],
        [
          1,
          2
        ],
        [
          1,
          3
        ],
        [
          1,
          4
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "마",
        "나",
        "다",
        "라",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        0,
        2
      ],
      [
        1,
        2
      ],
      [
        1,
        3
      ],
      [
        1,
        4
      ]
    ],
    "dimensions": [
      3,
      3,
      3
    ]
  },
  {
    "id": "N082",
    "type": "length",
    "labels": [
      "라",
      "다",
      "바",
      "나",
      "가",
      "마"
    ],
    "answers": [
      "2"
    ],
    "options": [
      {
        "id": "2",
        "label": "2 cm",
        "feedback": "★ 모서리와 ＝ 표시 모서리는 각각 2 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요."
      },
      {
        "id": "3",
        "label": "3 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "4",
        "label": "4 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "6",
        "label": "6 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      }
    ],
    "target": "0:e1",
    "title": "세 길이가 같은 상자의 ★ 길이는?",
    "instruction": "가로 2 cm, 세로 2 cm, 높이 2 cm인 상자예요.",
    "explanation": "★ 모서리와 ＝ 표시 모서리는 각각 2 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요.",
    "hint": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요.",
    "length": 2,
    "concept": "정육면체 길이 전이",
    "chapter": "length",
    "contentVersion": "96-v1",
    "signature": "length:one:2,2,2:[[\"0,0\",\"0,1\",\"0,2\",\"1,2\",\"1,3\",\"1,4\"],[[\"0.5,-0.5\",\"0.5,0.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "스스로",
    "misconceptions": [
      "펼친 방향과 길이 혼동"
    ],
    "paper": {
      "page": 83,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          0,
          2
        ],
        [
          1,
          2
        ],
        [
          1,
          3
        ],
        [
          1,
          4
        ]
      ],
      "dimensions": [
        2,
        2,
        2
      ],
      "labels": [
        "라",
        "다",
        "바",
        "나",
        "가",
        "마"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        0,
        2
      ],
      [
        1,
        2
      ],
      [
        1,
        3
      ],
      [
        1,
        4
      ]
    ],
    "dimensions": [
      2,
      2,
      2
    ]
  },
  {
    "id": "N083",
    "type": "length",
    "labels": [
      "나",
      "다",
      "마",
      "가",
      "바",
      "라"
    ],
    "answers": [
      "4"
    ],
    "options": [
      {
        "id": "4",
        "label": "4 cm",
        "feedback": "★ 모서리와 ＝ 표시 모서리는 각각 4 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요."
      },
      {
        "id": "5",
        "label": "5 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "6",
        "label": "6 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "12",
        "label": "12 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      }
    ],
    "target": "1:e0",
    "title": "세 길이가 같은 상자의 ★ 길이는?",
    "instruction": "가로 4 cm, 세로 4 cm, 높이 4 cm인 상자예요.",
    "explanation": "★ 모서리와 ＝ 표시 모서리는 각각 4 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요.",
    "hint": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요.",
    "length": 4,
    "concept": "정육면체 길이 전이",
    "chapter": "length",
    "contentVersion": "96-v1",
    "signature": "length:one:4,4,4:[[\"0,1\",\"1,0\",\"1,1\",\"1,2\",\"1,3\",\"2,1\"],[[\"0.5,-0.5\",\"1.5,-0.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "스스로",
    "misconceptions": [
      "펼친 방향과 길이 혼동"
    ],
    "paper": {
      "page": 84,
      "kind": "task",
      "cells": [
        [
          0,
          1
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          1,
          2
        ],
        [
          1,
          3
        ],
        [
          2,
          1
        ]
      ],
      "dimensions": [
        4,
        4,
        4
      ],
      "labels": [
        "나",
        "다",
        "마",
        "가",
        "바",
        "라"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        1
      ],
      [
        1,
        0
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        1,
        3
      ],
      [
        2,
        1
      ]
    ],
    "dimensions": [
      4,
      4,
      4
    ]
  },
  {
    "id": "N084",
    "type": "length",
    "labels": [
      "바",
      "가",
      "나",
      "라",
      "마",
      "다"
    ],
    "answers": [
      "3"
    ],
    "options": [
      {
        "id": "3",
        "label": "3 cm",
        "feedback": "★ 모서리와 ＝ 표시 모서리는 각각 3 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요."
      },
      {
        "id": "4",
        "label": "4 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "5",
        "label": "5 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      },
      {
        "id": "9",
        "label": "9 cm",
        "feedback": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요."
      }
    ],
    "target": "3:e2",
    "title": "세 길이가 같은 상자의 ★ 길이는?",
    "instruction": "가로 3 cm, 세로 3 cm, 높이 3 cm인 상자예요.",
    "explanation": "★ 모서리와 ＝ 표시 모서리는 각각 3 cm예요. 접으면 한 모서리로 만나고, 길이는 바뀌지 않아요.",
    "hint": "펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요.",
    "length": 3,
    "concept": "정육면체 길이 전이",
    "chapter": "length",
    "contentVersion": "96-v1",
    "signature": "length:one:3,3,3:[[\"0,0\",\"0,1\",\"1,1\",\"1,2\",\"2,2\",\"2,3\"],[[\"0.5,1.5\",\"0.5,2.5\"]]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "difficulty": "스스로",
    "misconceptions": [
      "펼친 방향과 길이 혼동"
    ],
    "paper": {
      "page": 85,
      "kind": "task",
      "cells": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          -1
        ],
        [
          2,
          -1
        ],
        [
          2,
          -2
        ],
        [
          3,
          -2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "바",
        "가",
        "나",
        "라",
        "마",
        "다"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        1,
        -1
      ],
      [
        2,
        -1
      ],
      [
        2,
        -2
      ],
      [
        3,
        -2
      ]
    ],
    "dimensions": [
      3,
      3,
      3
    ]
  },
  {
    "type": "build",
    "initialCells": [
      [
        -2,
        -2
      ],
      [
        -2,
        -1
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ]
    ],
    "solutionCells": [
      [
        -2,
        -2
      ],
      [
        -2,
        -1
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ],
      [
        0,
        0
      ]
    ],
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "options": [],
    "answers": [
      "-1,-1|-1,0|-1,1|-2,-1|-2,-2|0,-1",
      "-1,-1|-1,0|-1,1|-2,-1|-2,-2|0,0",
      "-1,-1|-1,0|-1,1|-2,-1|-2,-2|0,1"
    ],
    "title": "면 1개를 더 놓아 상자를 만들어요",
    "instruction": "‘주어진 면’은 그대로 두고 빈칸을 눌러요. 놓은 면은 다시 누르면 지워져요.",
    "explanation": "주어진 면을 모두 남기고 여섯 면이 겹치지 않게 상자를 닫았어요. 완성 방법은 여러 가지일 수 있어요.",
    "hint": "주어진 면과 모서리를 맞대어 이어 보세요. 한쪽을 여러 번 덮지 않도록 빈 곳을 생각해요.",
    "monochrome": false,
    "concept": "주어진 5면을 유지한 정육면체 구성",
    "difficulty": "함께",
    "id": "N085",
    "chapter": "build",
    "contentVersion": "96-v1",
    "signature": "build:[[0,0],[0,1],[0,2],[1,2],[1,3]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "misconceptions": [
      "면 수만 맞추고 연결을 무시"
    ],
    "paper": {
      "page": 86,
      "kind": "example",
      "cells": [
        [
          -2,
          -2
        ],
        [
          -2,
          -1
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ],
        [
          0,
          0
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        -2,
        -2
      ],
      [
        -2,
        -1
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "build",
    "initialCells": [
      [
        -2,
        -2
      ],
      [
        -2,
        -1
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        0
      ],
      [
        0,
        0
      ]
    ],
    "solutionCells": [
      [
        -2,
        -2
      ],
      [
        -2,
        -1
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        0
      ],
      [
        0,
        0
      ],
      [
        -1,
        1
      ]
    ],
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "options": [],
    "answers": [
      "-1,-1|-1,0|-1,1|-2,-1|-2,-2|0,0",
      "-1,-1|-1,0|-2,-1|-2,-2|0,0|0,1"
    ],
    "title": "면 1개를 더 놓아 상자를 만들어요",
    "instruction": "‘주어진 면’은 그대로 두고 빈칸을 눌러요. 놓은 면은 다시 누르면 지워져요.",
    "explanation": "주어진 면을 모두 남기고 여섯 면이 겹치지 않게 상자를 닫았어요. 완성 방법은 여러 가지일 수 있어요.",
    "hint": "주어진 면과 모서리를 맞대어 이어 보세요. 한쪽을 여러 번 덮지 않도록 빈 곳을 생각해요.",
    "monochrome": false,
    "concept": "주어진 5면을 유지한 정육면체 구성",
    "difficulty": "함께",
    "id": "N086",
    "chapter": "build",
    "contentVersion": "96-v1",
    "signature": "build:[[0,0],[0,1],[1,1],[1,2],[2,2]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "misconceptions": [
      "면 수만 맞추고 연결을 무시"
    ],
    "paper": {
      "page": 87,
      "kind": "example",
      "cells": [
        [
          -2,
          -2
        ],
        [
          -2,
          -1
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          0
        ],
        [
          0,
          0
        ],
        [
          -1,
          1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        -2,
        -2
      ],
      [
        -2,
        -1
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        0
      ],
      [
        0,
        0
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "build",
    "initialCells": [
      [
        -2,
        -1
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ],
      [
        0,
        0
      ]
    ],
    "solutionCells": [
      [
        -2,
        -1
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ],
      [
        0,
        0
      ],
      [
        -2,
        -2
      ]
    ],
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "options": [],
    "answers": [
      "-1,-1|-1,-2|-1,0|-1,1|-2,-1|0,0",
      "-1,-1|-1,0|-1,1|-1,2|-2,-1|0,0",
      "-1,-1|-1,0|-1,1|-2,-1|-2,-2|0,0",
      "-1,-1|-1,0|-1,1|-2,-1|0,0|1,0"
    ],
    "title": "면 1개를 더 놓아 상자를 만들어요",
    "instruction": "‘주어진 면’은 그대로 두고 빈칸을 눌러요. 놓은 면은 다시 누르면 지워져요.",
    "explanation": "주어진 면을 모두 남기고 여섯 면이 겹치지 않게 상자를 닫았어요. 완성 방법은 여러 가지일 수 있어요.",
    "hint": "주어진 면과 모서리를 맞대어 이어 보세요. 한쪽을 여러 번 덮지 않도록 빈 곳을 생각해요.",
    "monochrome": false,
    "concept": "주어진 5면을 유지한 정육면체 구성",
    "difficulty": "함께",
    "id": "N087",
    "chapter": "build",
    "contentVersion": "96-v1",
    "signature": "build:[[0,0],[0,1],[1,1],[1,2],[2,1]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "misconceptions": [
      "면 수만 맞추고 연결을 무시"
    ],
    "paper": {
      "page": 88,
      "kind": "example",
      "cells": [
        [
          -2,
          -1
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ],
        [
          0,
          0
        ],
        [
          -2,
          -2
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        -2,
        -1
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ],
      [
        0,
        0
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "build",
    "initialCells": [
      [
        0,
        0
      ],
      [
        -1,
        1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        -2
      ]
    ],
    "solutionCells": [
      [
        0,
        0
      ],
      [
        -1,
        1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        -2
      ],
      [
        -2,
        -1
      ]
    ],
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "options": [],
    "answers": [
      "-1,-1|-1,-2|-1,0|-1,1|-2,-1|0,0",
      "-1,-1|-1,-2|-1,0|-1,1|-2,-2|0,0",
      "-1,-1|-1,-2|-1,0|-1,1|-2,0|0,0",
      "-1,-1|-1,-2|-1,0|-1,1|-2,1|0,0"
    ],
    "title": "면 1개를 더 놓아 상자를 만들어요",
    "instruction": "‘주어진 면’은 그대로 두고 빈칸을 눌러요. 놓은 면은 다시 누르면 지워져요.",
    "explanation": "주어진 면을 모두 남기고 여섯 면이 겹치지 않게 상자를 닫았어요. 완성 방법은 여러 가지일 수 있어요.",
    "hint": "주어진 면과 모서리를 맞대어 이어 보세요. 한쪽을 여러 번 덮지 않도록 빈 곳을 생각해요.",
    "monochrome": false,
    "concept": "주어진 5면을 유지한 정육면체 구성",
    "difficulty": "함께",
    "id": "N088",
    "chapter": "build",
    "contentVersion": "96-v1",
    "signature": "build:[[0,0],[0,1],[0,2],[0,3],[1,1]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "misconceptions": [
      "면 수만 맞추고 연결을 무시"
    ],
    "paper": {
      "page": 89,
      "kind": "example",
      "cells": [
        [
          0,
          0
        ],
        [
          -1,
          1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          -2
        ],
        [
          -2,
          -1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        0,
        0
      ],
      [
        -1,
        1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        -2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "build",
    "initialCells": [
      [
        -2,
        -2
      ],
      [
        -2,
        -1
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        0
      ]
    ],
    "solutionCells": [
      [
        -2,
        -2
      ],
      [
        -2,
        -1
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ],
      [
        0,
        0
      ]
    ],
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "options": [],
    "answers": [
      "-1,-1|-1,0|-1,1|-2,-1|-2,-2|0,-1",
      "-1,-1|-1,0|-1,1|-2,-1|-2,-2|0,0",
      "-1,-1|-1,0|-1,1|-2,-1|-2,-2|0,1",
      "-1,-1|-1,0|-2,-1|-2,-2|0,-1|1,-1",
      "-1,-1|-1,0|-2,-1|-2,-2|0,0|0,1"
    ],
    "title": "면 2개를 더 놓아 상자를 만들어요",
    "instruction": "‘주어진 면’은 그대로 두고 빈칸을 눌러요. 놓은 면은 다시 누르면 지워져요.",
    "explanation": "주어진 면을 모두 남기고 여섯 면이 겹치지 않게 상자를 닫았어요. 완성 방법은 여러 가지일 수 있어요.",
    "hint": "주어진 면과 모서리를 맞대어 이어 보세요. 한쪽을 여러 번 덮지 않도록 빈 곳을 생각해요.",
    "monochrome": false,
    "concept": "주어진 4면을 유지한 정육면체 구성",
    "difficulty": "함께",
    "id": "N089",
    "chapter": "build",
    "contentVersion": "96-v1",
    "signature": "build:[[0,0],[0,1],[1,1],[1,2]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "misconceptions": [
      "면 수만 맞추고 연결을 무시"
    ],
    "paper": {
      "page": 90,
      "kind": "example",
      "cells": [
        [
          -2,
          -2
        ],
        [
          -2,
          -1
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ],
        [
          0,
          0
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        -2,
        -2
      ],
      [
        -2,
        -1
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        0
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "build",
    "initialCells": [
      [
        -2,
        -1
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ]
    ],
    "solutionCells": [
      [
        -2,
        -1
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ],
      [
        -2,
        -2
      ],
      [
        0,
        0
      ]
    ],
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "options": [],
    "answers": [
      "-1,-1|-1,-2|-1,0|-1,1|-2,-1|0,-1",
      "-1,-1|-1,-2|-1,0|-1,1|-2,-1|0,-2",
      "-1,-1|-1,-2|-1,0|-1,1|-2,-1|0,0",
      "-1,-1|-1,-2|-1,0|-1,1|-2,-1|0,1",
      "-1,-1|-1,0|-1,1|-1,2|-2,-1|0,-1",
      "-1,-1|-1,0|-1,1|-1,2|-2,-1|0,0",
      "-1,-1|-1,0|-1,1|-1,2|-2,-1|0,1",
      "-1,-1|-1,0|-1,1|-1,2|-2,-1|0,2",
      "-1,-1|-1,0|-1,1|-2,-1|-2,-2|0,-1",
      "-1,-1|-1,0|-1,1|-2,-1|-2,-2|0,0",
      "-1,-1|-1,0|-1,1|-2,-1|-2,-2|0,1",
      "-1,-1|-1,0|-1,1|-2,-1|0,-1|0,-2",
      "-1,-1|-1,0|-1,1|-2,-1|0,0|1,0",
      "-1,-1|-1,0|-1,1|-2,-1|0,1|0,2"
    ],
    "title": "면 2개를 더 놓아 상자를 만들어요",
    "instruction": "‘주어진 면’은 그대로 두고 빈칸을 눌러요. 놓은 면은 다시 누르면 지워져요.",
    "explanation": "주어진 면을 모두 남기고 여섯 면이 겹치지 않게 상자를 닫았어요. 완성 방법은 여러 가지일 수 있어요.",
    "hint": "주어진 면과 모서리를 맞대어 이어 보세요. 한쪽을 여러 번 덮지 않도록 빈 곳을 생각해요.",
    "monochrome": false,
    "concept": "주어진 4면을 유지한 정육면체 구성",
    "difficulty": "함께",
    "id": "N090",
    "chapter": "build",
    "contentVersion": "96-v1",
    "signature": "build:[[0,0],[0,1],[0,2],[1,0]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "misconceptions": [
      "면 수만 맞추고 연결을 무시"
    ],
    "paper": {
      "page": 91,
      "kind": "example",
      "cells": [
        [
          -2,
          -1
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ],
        [
          -2,
          -2
        ],
        [
          0,
          0
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        -2,
        -1
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "build",
    "initialCells": [
      [
        -1,
        -1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ],
      [
        0,
        0
      ]
    ],
    "solutionCells": [
      [
        -1,
        -1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ],
      [
        0,
        0
      ],
      [
        -2,
        -2
      ],
      [
        -2,
        -1
      ]
    ],
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "options": [],
    "answers": [
      "-1,-1|-1,-2|-1,0|-1,1|-2,-1|0,0",
      "-1,-1|-1,-2|-1,0|-1,1|-2,-2|0,0",
      "-1,-1|-1,-2|-1,0|-1,1|-2,0|0,0",
      "-1,-1|-1,-2|-1,0|-1,1|-2,1|0,0",
      "-1,-1|-1,0|-1,1|-1,2|-2,-1|0,0",
      "-1,-1|-1,0|-1,1|-1,2|-2,0|0,0",
      "-1,-1|-1,0|-1,1|-1,2|-2,1|0,0",
      "-1,-1|-1,0|-1,1|-1,2|-2,2|0,0",
      "-1,-1|-1,0|-1,1|-2,-1|-2,-2|0,0",
      "-1,-1|-1,0|-1,1|-2,-1|0,0|1,0",
      "-1,-1|-1,0|-1,1|-2,0|0,0|1,0",
      "-1,-1|-1,0|-1,1|-2,1|-2,2|0,0",
      "-1,-1|-1,0|-1,1|-2,1|0,0|1,0",
      "-1,-1|-1,0|-1,1|0,0|1,0|2,0"
    ],
    "title": "면 2개를 더 놓아 상자를 만들어요",
    "instruction": "‘주어진 면’은 그대로 두고 빈칸을 눌러요. 놓은 면은 다시 누르면 지워져요.",
    "explanation": "주어진 면을 모두 남기고 여섯 면이 겹치지 않게 상자를 닫았어요. 완성 방법은 여러 가지일 수 있어요.",
    "hint": "주어진 면과 모서리를 맞대어 이어 보세요. 한쪽을 여러 번 덮지 않도록 빈 곳을 생각해요.",
    "monochrome": true,
    "concept": "주어진 4면을 유지한 정육면체 구성",
    "difficulty": "함께",
    "id": "N091",
    "chapter": "build",
    "contentVersion": "96-v1",
    "signature": "build:[[0,0],[0,1],[0,2],[1,1]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "misconceptions": [
      "면 수만 맞추고 연결을 무시"
    ],
    "paper": {
      "page": 92,
      "kind": "example",
      "cells": [
        [
          -1,
          -1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ],
        [
          0,
          0
        ],
        [
          -2,
          -2
        ],
        [
          -2,
          -1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        -1,
        -1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ],
      [
        0,
        0
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "build",
    "initialCells": [
      [
        -1,
        1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        -2
      ]
    ],
    "solutionCells": [
      [
        -1,
        1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        -2
      ],
      [
        0,
        0
      ],
      [
        -2,
        -1
      ]
    ],
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "options": [],
    "answers": [
      "-1,-1|-1,-2|-1,0|-1,1|-2,-1|0,-1",
      "-1,-1|-1,-2|-1,0|-1,1|-2,-1|0,-2",
      "-1,-1|-1,-2|-1,0|-1,1|-2,-1|0,0",
      "-1,-1|-1,-2|-1,0|-1,1|-2,-1|0,1",
      "-1,-1|-1,-2|-1,0|-1,1|-2,-2|0,-1",
      "-1,-1|-1,-2|-1,0|-1,1|-2,-2|0,-2",
      "-1,-1|-1,-2|-1,0|-1,1|-2,-2|0,0",
      "-1,-1|-1,-2|-1,0|-1,1|-2,-2|0,1",
      "-1,-1|-1,-2|-1,0|-1,1|-2,0|0,-1",
      "-1,-1|-1,-2|-1,0|-1,1|-2,0|0,-2",
      "-1,-1|-1,-2|-1,0|-1,1|-2,0|0,0",
      "-1,-1|-1,-2|-1,0|-1,1|-2,0|0,1",
      "-1,-1|-1,-2|-1,0|-1,1|-2,1|0,-1",
      "-1,-1|-1,-2|-1,0|-1,1|-2,1|0,-2",
      "-1,-1|-1,-2|-1,0|-1,1|-2,1|0,0",
      "-1,-1|-1,-2|-1,0|-1,1|-2,1|0,1"
    ],
    "title": "면 2개를 더 놓아 상자를 만들어요",
    "instruction": "‘주어진 면’은 그대로 두고 빈칸을 눌러요. 놓은 면은 다시 누르면 지워져요.",
    "explanation": "주어진 면을 모두 남기고 여섯 면이 겹치지 않게 상자를 닫았어요. 완성 방법은 여러 가지일 수 있어요.",
    "hint": "주어진 면과 모서리를 맞대어 이어 보세요. 한쪽을 여러 번 덮지 않도록 빈 곳을 생각해요.",
    "monochrome": true,
    "concept": "주어진 4면을 유지한 정육면체 구성",
    "difficulty": "함께",
    "id": "N092",
    "chapter": "build",
    "contentVersion": "96-v1",
    "signature": "build:[[0,0],[0,1],[0,2],[0,3]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "misconceptions": [
      "면 수만 맞추고 연결을 무시"
    ],
    "paper": {
      "page": 93,
      "kind": "example",
      "cells": [
        [
          -1,
          1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          -2
        ],
        [
          0,
          0
        ],
        [
          -2,
          -1
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        -1,
        1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        -2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "build",
    "initialCells": [
      [
        -2,
        -2
      ],
      [
        -2,
        -1
      ],
      [
        -1,
        -1
      ]
    ],
    "solutionCells": [
      [
        -2,
        -2
      ],
      [
        -2,
        -1
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ],
      [
        0,
        0
      ]
    ],
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "options": [],
    "answers": [
      "-1,-1|-1,0|-1,1|-2,-1|-2,-2|0,-1",
      "-1,-1|-1,0|-1,1|-2,-1|-2,-2|0,0",
      "-1,-1|-1,0|-1,1|-2,-1|-2,-2|0,1",
      "-1,-1|-1,0|-2,-1|-2,-2|0,-1|1,-1",
      "-1,-1|-1,0|-2,-1|-2,-2|0,0|0,1",
      "-1,-1|-2,-1|-2,-2|-2,0|0,-1|1,-1",
      "-1,-1|-2,-1|-2,-2|0,-1|0,0|1,-1",
      "-1,-1|-2,-1|-2,-2|0,-1|0,0|1,0",
      "-1,-1|-2,-1|-2,-2|0,-1|1,-1|1,0"
    ],
    "title": "면 3개를 더 놓아 상자를 만들어요",
    "instruction": "‘주어진 면’은 그대로 두고 빈칸을 눌러요. 놓은 면은 다시 누르면 지워져요.",
    "explanation": "주어진 면을 모두 남기고 여섯 면이 겹치지 않게 상자를 닫았어요. 완성 방법은 여러 가지일 수 있어요.",
    "hint": "주어진 면과 모서리를 맞대어 이어 보세요. 한쪽을 여러 번 덮지 않도록 빈 곳을 생각해요.",
    "monochrome": true,
    "concept": "주어진 3면을 유지한 정육면체 구성",
    "difficulty": "도전",
    "id": "N093",
    "chapter": "build",
    "contentVersion": "96-v1",
    "signature": "build:[[0,0],[0,1],[1,0]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "misconceptions": [
      "면 수만 맞추고 연결을 무시"
    ],
    "paper": {
      "page": 94,
      "kind": "example",
      "cells": [
        [
          -2,
          -2
        ],
        [
          -2,
          -1
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ],
        [
          0,
          0
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        -2,
        -2
      ],
      [
        -2,
        -1
      ],
      [
        -1,
        -1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "build",
    "initialCells": [
      [
        -1,
        -1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ]
    ],
    "solutionCells": [
      [
        -1,
        -1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ],
      [
        -2,
        -2
      ],
      [
        -2,
        -1
      ],
      [
        0,
        0
      ]
    ],
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "options": [],
    "answers": [
      "-1,-1|-1,-2|-1,0|-1,1|-2,-1|0,-1",
      "-1,-1|-1,-2|-1,0|-1,1|-2,-1|0,-2",
      "-1,-1|-1,-2|-1,0|-1,1|-2,-1|0,0",
      "-1,-1|-1,-2|-1,0|-1,1|-2,-1|0,1",
      "-1,-1|-1,-2|-1,0|-1,1|-2,-2|0,-1",
      "-1,-1|-1,-2|-1,0|-1,1|-2,-2|0,-2",
      "-1,-1|-1,-2|-1,0|-1,1|-2,-2|0,0",
      "-1,-1|-1,-2|-1,0|-1,1|-2,-2|0,1",
      "-1,-1|-1,-2|-1,0|-1,1|-2,0|0,-1",
      "-1,-1|-1,-2|-1,0|-1,1|-2,0|0,-2",
      "-1,-1|-1,-2|-1,0|-1,1|-2,0|0,0",
      "-1,-1|-1,-2|-1,0|-1,1|-2,0|0,1",
      "-1,-1|-1,-2|-1,0|-1,1|-2,1|0,-1",
      "-1,-1|-1,-2|-1,0|-1,1|-2,1|0,-2",
      "-1,-1|-1,-2|-1,0|-1,1|-2,1|0,0",
      "-1,-1|-1,-2|-1,0|-1,1|-2,1|0,1",
      "-1,-1|-1,0|-1,1|-1,2|-2,-1|0,-1",
      "-1,-1|-1,0|-1,1|-1,2|-2,-1|0,0",
      "-1,-1|-1,0|-1,1|-1,2|-2,-1|0,1",
      "-1,-1|-1,0|-1,1|-1,2|-2,-1|0,2",
      "-1,-1|-1,0|-1,1|-1,2|-2,0|0,-1",
      "-1,-1|-1,0|-1,1|-1,2|-2,0|0,0",
      "-1,-1|-1,0|-1,1|-1,2|-2,0|0,1",
      "-1,-1|-1,0|-1,1|-1,2|-2,0|0,2",
      "-1,-1|-1,0|-1,1|-1,2|-2,1|0,-1",
      "-1,-1|-1,0|-1,1|-1,2|-2,1|0,0",
      "-1,-1|-1,0|-1,1|-1,2|-2,1|0,1",
      "-1,-1|-1,0|-1,1|-1,2|-2,1|0,2",
      "-1,-1|-1,0|-1,1|-1,2|-2,2|0,-1",
      "-1,-1|-1,0|-1,1|-1,2|-2,2|0,0",
      "-1,-1|-1,0|-1,1|-1,2|-2,2|0,1",
      "-1,-1|-1,0|-1,1|-1,2|-2,2|0,2",
      "-1,-1|-1,0|-1,1|-2,-1|-2,-2|0,-1",
      "-1,-1|-1,0|-1,1|-2,-1|-2,-2|0,0",
      "-1,-1|-1,0|-1,1|-2,-1|-2,-2|0,1",
      "-1,-1|-1,0|-1,1|-2,-1|0,-1|0,-2",
      "-1,-1|-1,0|-1,1|-2,-1|0,0|1,0",
      "-1,-1|-1,0|-1,1|-2,-1|0,1|0,2",
      "-1,-1|-1,0|-1,1|-2,0|0,-1|0,-2",
      "-1,-1|-1,0|-1,1|-2,0|0,0|1,0",
      "-1,-1|-1,0|-1,1|-2,0|0,1|0,2",
      "-1,-1|-1,0|-1,1|-2,1|-2,2|0,-1",
      "-1,-1|-1,0|-1,1|-2,1|-2,2|0,0",
      "-1,-1|-1,0|-1,1|-2,1|-2,2|0,1",
      "-1,-1|-1,0|-1,1|-2,1|0,-1|0,-2",
      "-1,-1|-1,0|-1,1|-2,1|0,0|1,0",
      "-1,-1|-1,0|-1,1|-2,1|0,1|0,2",
      "-1,-1|-1,0|-1,1|0,0|1,0|2,0"
    ],
    "title": "면 3개를 더 놓아 상자를 만들어요",
    "instruction": "‘주어진 면’은 그대로 두고 빈칸을 눌러요. 놓은 면은 다시 누르면 지워져요.",
    "explanation": "주어진 면을 모두 남기고 여섯 면이 겹치지 않게 상자를 닫았어요. 완성 방법은 여러 가지일 수 있어요.",
    "hint": "주어진 면과 모서리를 맞대어 이어 보세요. 한쪽을 여러 번 덮지 않도록 빈 곳을 생각해요.",
    "monochrome": true,
    "concept": "주어진 3면을 유지한 정육면체 구성",
    "difficulty": "도전",
    "id": "N094",
    "chapter": "build",
    "contentVersion": "96-v1",
    "signature": "build:[[0,0],[0,1],[0,2]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "misconceptions": [
      "면 수만 맞추고 연결을 무시"
    ],
    "paper": {
      "page": 95,
      "kind": "example",
      "cells": [
        [
          -1,
          -1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ],
        [
          -2,
          -2
        ],
        [
          -2,
          -1
        ],
        [
          0,
          0
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        -1,
        -1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "build",
    "initialCells": [
      [
        -2,
        -2
      ],
      [
        -2,
        -1
      ]
    ],
    "solutionCells": [
      [
        -2,
        -2
      ],
      [
        -2,
        -1
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ],
      [
        0,
        0
      ]
    ],
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "options": [],
    "answers": [
      "-1,-1|-1,0|-1,1|-2,-1|-2,-2|0,-1",
      "-1,-1|-1,0|-1,1|-2,-1|-2,-2|0,0",
      "-1,-1|-1,0|-1,1|-2,-1|-2,-2|0,1",
      "-1,-1|-1,0|-2,-1|-2,-2|0,-1|1,-1",
      "-1,-1|-1,0|-2,-1|-2,-2|0,0|0,1",
      "-1,-1|-2,-1|-2,-2|-2,0|0,-1|1,-1",
      "-1,-1|-2,-1|-2,-2|0,-1|0,0|1,-1",
      "-1,-1|-2,-1|-2,-2|0,-1|0,0|1,0",
      "-1,-1|-2,-1|-2,-2|0,-1|1,-1|1,0",
      "-1,0|-1,1|-1,2|-2,-1|-2,-2|-2,0"
    ],
    "title": "면 4개를 더 놓아 상자를 만들어요",
    "instruction": "‘주어진 면’은 그대로 두고 빈칸을 눌러요. 놓은 면은 다시 누르면 지워져요.",
    "explanation": "주어진 면을 모두 남기고 여섯 면이 겹치지 않게 상자를 닫았어요. 완성 방법은 여러 가지일 수 있어요.",
    "hint": "주어진 면과 모서리를 맞대어 이어 보세요. 한쪽을 여러 번 덮지 않도록 빈 곳을 생각해요.",
    "monochrome": true,
    "concept": "주어진 2면을 유지한 정육면체 구성",
    "difficulty": "도전",
    "id": "N095",
    "chapter": "build",
    "contentVersion": "96-v1",
    "signature": "build:[[0,0],[0,1]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "misconceptions": [
      "면 수만 맞추고 연결을 무시"
    ],
    "paper": {
      "page": 96,
      "kind": "example",
      "cells": [
        [
          -2,
          -2
        ],
        [
          -2,
          -1
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ],
        [
          0,
          0
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        -2,
        -2
      ],
      [
        -2,
        -1
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  },
  {
    "type": "build",
    "initialCells": [
      [
        -2,
        -2
      ]
    ],
    "solutionCells": [
      [
        -2,
        -2
      ],
      [
        -2,
        -1
      ],
      [
        -1,
        -1
      ],
      [
        -1,
        0
      ],
      [
        -1,
        1
      ],
      [
        0,
        0
      ]
    ],
    "labels": [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바"
    ],
    "options": [],
    "answers": [
      "-1,-1|-1,-2|-1,0|-1,1|-2,-2|0,-1",
      "-1,-1|-1,-2|-1,0|-1,1|-2,-2|0,-2",
      "-1,-1|-1,-2|-1,0|-1,1|-2,-2|0,0",
      "-1,-1|-1,-2|-1,0|-1,1|-2,-2|0,1",
      "-1,-1|-1,-2|-1,0|-2,-2|0,-1|1,-1",
      "-1,-1|-1,-2|-1,0|-2,-2|0,0|0,1",
      "-1,-1|-1,-2|-2,-2|0,-1|0,0|1,-1",
      "-1,-1|-1,-2|-2,-2|0,-1|0,0|1,0",
      "-1,-1|-1,-2|-2,-2|0,-1|1,-1|1,0",
      "-1,-1|-1,0|-1,1|-2,-1|-2,-2|0,-1",
      "-1,-1|-1,0|-1,1|-2,-1|-2,-2|0,0",
      "-1,-1|-1,0|-1,1|-2,-1|-2,-2|0,1",
      "-1,-1|-1,0|-2,-1|-2,-2|0,-1|1,-1",
      "-1,-1|-1,0|-2,-1|-2,-2|0,0|0,1",
      "-1,-1|-2,-1|-2,-2|-2,0|0,-1|1,-1",
      "-1,-1|-2,-1|-2,-2|0,-1|0,0|1,-1",
      "-1,-1|-2,-1|-2,-2|0,-1|0,0|1,0",
      "-1,-1|-2,-1|-2,-2|0,-1|1,-1|1,0",
      "-1,-2|-2,-2|0,-1|0,-2|1,-1|2,-1",
      "-1,0|-1,1|-1,2|-2,-1|-2,-2|-2,0"
    ],
    "title": "면 5개를 더 놓아 상자를 만들어요",
    "instruction": "‘주어진 면’은 그대로 두고 빈칸을 눌러요. 놓은 면은 다시 누르면 지워져요.",
    "explanation": "주어진 면을 모두 남기고 여섯 면이 겹치지 않게 상자를 닫았어요. 완성 방법은 여러 가지일 수 있어요.",
    "hint": "주어진 면과 모서리를 맞대어 이어 보세요. 한쪽을 여러 번 덮지 않도록 빈 곳을 생각해요.",
    "monochrome": true,
    "concept": "주어진 1면을 유지한 정육면체 구성",
    "difficulty": "도전",
    "id": "N096",
    "chapter": "build",
    "contentVersion": "96-v1",
    "signature": "build:[[0,0]]",
    "curriculum": "5학년 2학기 직육면체와 전개도 · 교과서 118~125쪽 / 익힘 76~79쪽 연계",
    "misconceptions": [
      "면 수만 맞추고 연결을 무시"
    ],
    "paper": {
      "page": 97,
      "kind": "example",
      "cells": [
        [
          -2,
          -2
        ],
        [
          -2,
          -1
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ],
        [
          0,
          0
        ]
      ],
      "dimensions": [
        3,
        3,
        3
      ],
      "labels": [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바"
      ],
      "closed": true
    },
    "foldSequence": [
      0,
      1,
      2,
      3,
      4
    ],
    "cells": [
      [
        -2,
        -2
      ]
    ],
    "dimensions": [
      1,
      1,
      1
    ]
  }
];
