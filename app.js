const closeBtn = document.getElementById("close");
const fetchBtn = document.getElementById("fetch");
const nameTextArea = document.getElementById("name");
const autoComplete = document.getElementById("autoComplete");
const chapSelect = document.getElementById("chap");
const startLine = document.getElementById("startLine");
const endLine = document.getElementById("endLine");

const global = {
  name: "",
  kor: "",
  chap: "",
  startLine: "",
  endLine: "",
  hashedContent: {}
};

const makeLine = (name, chap) => {
  global.name = name;
  global.chap = chap;
  const xhr = new XMLHttpRequest();
  xhr.onload = function(e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        const string = xhr.responseText;
        startLine.innerHTML = string;
        endLine.innerHTML = string;
      } else {
        console.error(xhr.statusText);
      }
    }
  };
  xhr.open(
    "get",
    `https://www.bskorea.or.kr/bible/getsec.ajax.php?&version=GAE&book=${name}&chap=${chap}`
  );
  xhr.send();
};

const makeChapter = book => {
  const fragment = document.createDocumentFragment();
  book.slice(2).forEach(chap => {
    const option = document.createElement("option");
    option.value = chap;
    option.innerHTML = chap;
    fragment.append(option);
  });
  return fragment;
};

nameTextArea.addEventListener("keyup", e => {
  const inputValue = e.target.value;
  const fragment = document.createDocumentFragment();
  let autoList;
  if (inputValue) {
    autoList = szGAEBook.filter(book => {
      return book[0].includes(inputValue);
    });
    autoList.forEach(item => {
      const li = document.createElement("li");
      const name = item[0]; // ex.창세기

      li.innerHTML = name;
      li.style.listStyle = "none";
      li.addEventListener("click", e => {
        nameTextArea.value = name;
        global.kor = name;
        chapSelect.innerHTML = "";
        chapSelect.append(makeChapter(autoList.find(item => item[0])));
        makeLine(item[1], chapSelect.options[chapSelect.selectedIndex].value);
        chapSelect.addEventListener("change", e =>
          makeLine(item[1], chapSelect.options[chapSelect.selectedIndex].value)
        );
      });
      fragment.append(li);
    });
    autoComplete.innerHTML = "";
    autoComplete.append(fragment);
  }
});

const fetchText = (
  name = "gen",
  chap = "1",
  startLine = "1",
  endLine = "1"
) => {
  // name: 창세기
  // chap: 1장
  // startLine: 1장부터
  // endLine: 2장까지
  console.log(name, chap, startLine, endLine);
  const xhr = new XMLHttpRequest();
  xhr.onload = function(e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        const string = xhr.responseText;
        const doc = new DOMParser().parseFromString(string, "text/html");
        const textWrapper = doc.getElementById("tdBible1");
        const preText = textWrapper.innerText;
        const arrayOfLines = preText
          .replace(/([ㄱ-ㅎ]|[0-9])\)/g, "")
          .match(/[^\r\n]+/g)
          .filter(line => Number.isInteger(parseInt(line[0], 10)));
        const pptx = new PptxGenJS();
        for (let i = startLine; i <= endLine; i++) {
          const slide = pptx.addNewSlide();
          slide.addText(arrayOfLines[i - 1], {
            x: 1.5,
            y: 1.5,
            fontSize: 18,
            color: "333333"
          });
        }
        pptx.save(`${global.kor}_${chap}_${startLine}_${endLine}`);
      } else {
        console.error(xhr.statusText);
      }
    }
  };
  xhr.open(
    "get",
    `https://www.bskorea.or.kr/bible/korbibReadpage.php?version=GAE&book=${name}&chap=${chap}`
  );
  xhr.send();
};

fetchBtn.addEventListener("click", e => {
  let start = startLine.options[startLine.selectedIndex].value;
  let end = endLine.options[endLine.selectedIndex].value;
  fetchText(global.name, global.chap, start, end);
});
closeBtn.addEventListener("click", e => {
  if (confirm("진짜루 닫을꺼져??")) {
    window.close();
  }
});
