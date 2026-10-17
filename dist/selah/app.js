const passages = {
  today: [
    { text: "내가 너와 함께 함이라", ref: "이사야 41:10", reflection: "오늘 혼자 감당하려 했던 일은 무엇인가요? 그 자리에 함께하시는 하나님을 조용히 떠올려 보세요.", prayer: "하나님, 오늘 제 곁에 계심을 믿고 한 걸음 내딛게 해주세요." },
    { text: "주의 말씀은 내 발에 등이요 내 길에 빛이니이다", ref: "시편 119:105", reflection: "멀리 있는 답보다 오늘 비추어 주시는 한 걸음은 무엇인지 생각해 보세요.", prayer: "주님, 모든 길을 알지 못해도 오늘 순종할 빛을 보게 해주세요." },
    { text: "항상 기뻐하라 쉬지 말고 기도하라", ref: "데살로니가전서 5:16–17", reflection: "오늘의 평범한 순간 하나를 기도와 감사로 바꾼다면 무엇일까요?", prayer: "주님, 일상 속에서 주님을 기억하는 마음을 제게 주세요." }
  ],
  comfort: [
    { text: "상한 마음을 고치시며 그들의 상처를 싸매시는도다", ref: "시편 147:3", reflection: "감추지 않고 하나님께 보여 드리고 싶은 상처가 있나요? 이름 붙여 조용히 맡겨 보세요.", prayer: "치유하시는 하나님, 제 아픈 마음을 부드럽게 만져 주세요." },
    { text: "애통하는 자는 복이 있나니 그들이 위로를 받을 것임이요", ref: "마태복음 5:4", reflection: "슬픔을 서둘러 없애려 하지 말고, 잠시 있는 그대로 바라보세요.", prayer: "주님, 제 눈물을 아시는 주님의 위로 안에 머물게 해주세요." },
    { text: "수고하고 무거운 짐 진 자들아 다 내게로 오라", ref: "마태복음 11:28", reflection: "지금 가장 무겁게 느껴지는 짐 하나를 손에서 내려놓는 모습을 그려 보세요.", prayer: "예수님, 제가 지고 있던 무거운 짐을 주님께 맡깁니다." }
  ],
  rest: [
    { text: "너희는 가만히 있어 내가 하나님 됨을 알지어다", ref: "시편 46:10", reflection: "해결하려는 마음을 잠시 멈추고, 30초 동안 호흡하며 이 말씀에 머물러 보세요.", prayer: "하나님, 분주함을 멈추고 주님이 하나님이심을 신뢰하게 해주세요." },
    { text: "그가 나를 푸른 풀밭에 누이시며", ref: "시편 23:2", reflection: "몸과 마음이 회복되기 위해 오늘 허락할 수 있는 작은 쉼은 무엇인가요?", prayer: "목자 되신 주님, 지친 저를 평안한 자리로 이끌어 주세요." },
    { text: "평안을 너희에게 끼치노니 곧 나의 평안을 너희에게 주노라", ref: "요한복음 14:27", reflection: "환경이 바뀌기 전에 마음에 먼저 필요한 평안은 어떤 모습인가요?", prayer: "주님, 상황을 넘어서는 주님의 평안으로 제 마음을 지켜 주세요." }
  ],
  gratitude: [
    { text: "여호와께 감사하라 그는 선하시며", ref: "시편 136:1", reflection: "오늘 당연하게 지나쳤던 선물 세 가지를 천천히 떠올려 보세요.", prayer: "선하신 하나님, 작은 은혜를 알아보는 눈을 열어 주세요." },
    { text: "범사에 감사하라", ref: "데살로니가전서 5:18", reflection: "어려움 자체가 아니라, 그 가운데 여전히 남아 있는 은혜는 무엇인가요?", prayer: "주님, 모든 순간에 함께하시는 주님을 발견하며 감사하게 해주세요." },
    { text: "이 날은 여호와께서 정하신 것이라", ref: "시편 118:24", reflection: "오늘 하루를 새 선물로 받는다면 무엇을 다르게 바라볼 수 있을까요?", prayer: "하나님, 주신 오늘을 기뻐하며 충실히 살아가게 해주세요." }
  ],
  decision: [
    { text: "너는 마음을 다하여 여호와를 신뢰하고", ref: "잠언 3:5", reflection: "내 계산만으로 붙잡고 있는 부분과 하나님께 맡겨야 할 부분을 나누어 보세요.", prayer: "주님, 제 생각만 의지하지 않고 주님의 지혜를 구하게 해주세요." },
    { text: "너희 중에 누구든지 지혜가 부족하거든 하나님께 구하라", ref: "야고보서 1:5", reflection: "결정에서 두려움이 아닌 사랑과 진실을 선택한다면 어느 쪽에 가까울까요?", prayer: "지혜의 하나님, 조급함을 내려놓고 바른 길을 분별하게 해주세요." },
    { text: "내가 마땅히 행할 길을 내게 가르치소서", ref: "시편 143:8", reflection: "결과보다 과정에서 지켜야 할 믿음의 기준은 무엇인가요?", prayer: "주님, 제가 걸어야 할 길을 보이시고 순종할 용기를 주세요." }
  ],
  relationship: [
    { text: "사랑은 오래 참고 사랑은 온유하며", ref: "고린도전서 13:4", reflection: "오늘 한 사람에게 보여 줄 수 있는 인내 또는 온유의 행동은 무엇인가요?", prayer: "사랑의 하나님, 제 말과 태도에 주님의 온유함을 더해 주세요." },
    { text: "서로 친절하게 하며 불쌍히 여기며 서로 용서하기를", ref: "에베소서 4:32", reflection: "상대를 바꾸기 전에 내 마음에서 부드러워져야 할 부분은 무엇인가요?", prayer: "주님, 받은 용서를 기억하며 관계 속에서 은혜를 선택하게 해주세요." },
    { text: "화평하게 하는 자는 복이 있나니", ref: "마태복음 5:9", reflection: "옳음을 증명하는 것보다 평화를 만들기 위해 할 수 있는 작은 행동을 찾아보세요.", prayer: "주님, 갈등 가운데 진실하고 따뜻한 화평의 도구가 되게 해주세요." }
  ]
};

let selectedTheme = "today";
let currentPassage = null;
let previousIndexes = {};

const themes = document.querySelectorAll(".theme");
const result = document.querySelector("#result");
const verseText = document.querySelector("#verse-text");
const verseReference = document.querySelector("#verse-reference");
const reflection = document.querySelector("#reflection");
const prayer = document.querySelector("#prayer");
const toast = document.querySelector("#toast");

themes.forEach((button) => {
  button.addEventListener("click", () => {
    selectedTheme = button.dataset.theme;
    themes.forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
  });
});

function choosePassage() {
  const list = passages[selectedTheme];
  let index = Math.floor(Math.random() * list.length);
  if (list.length > 1 && previousIndexes[selectedTheme] === index) index = (index + 1) % list.length;
  previousIndexes[selectedTheme] = index;
  currentPassage = list[index];
  verseText.textContent = `“${currentPassage.text}”`;
  verseReference.textContent = currentPassage.ref;
  reflection.textContent = currentPassage.reflection;
  prayer.textContent = currentPassage.prayer;
  result.hidden = false;
  result.classList.remove("reveal");
  requestAnimationFrame(() => result.classList.add("reveal"));
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1800);
}

document.querySelector("#meet-button").addEventListener("click", choosePassage);
document.querySelector("#again-button").addEventListener("click", choosePassage);
document.querySelector("#copy-button").addEventListener("click", async () => {
  if (!currentPassage) return;
  const text = `${currentPassage.text}\n— ${currentPassage.ref}\n\n묵상: ${currentPassage.reflection}`;
  try {
    await navigator.clipboard.writeText(text);
    showToast("말씀을 복사했습니다.");
  } catch {
    showToast("복사하지 못했습니다. 다시 시도해 주세요.");
  }
});
