const questions = [];
const answers = [];
const categories = [];

async function getRandom(type) {
  let val = 100;
  let addNewCategory = 0;

  for (let i = 0; i < 10; i++) {
    const response = await axios.get(
      `http://jservice.io/api/clues?value=${val}&min_date=1985-02-20`
    );
    const randomData = response.data;

    for (let outer = 0; outer < randomData.length; outer++) {
      if (randomData && randomData.length > 0) {
        const title = randomData[outer]?.category?.title;

        if (title !== undefined && title.toLowerCase().includes(type)) {
          questions.push(randomData[outer].question);
          answers.push(randomData[outer].answer);
          addNewCategory += 1;
          val += 100;
        }
      }
    }
  }

  const newCategory = {
    title: type,
    clues: Array.from({ length: addNewCategory }, (_, i) => ({
      question: questions[i],
      answer: answers[i],
      showing: null,
    })),
  };

  categories.push(newCategory);
}

async function fillTable() {
  for (let i = 0; i < categories.length; i++) {
    const categoryTable = categories[i];
    const categoryArray = [categoryTable.title];

    for (let j = 0; j < categoryTable.clues.length; j++) {
      $("table#jeopardy").append(`
        <tr class="qanda=${j}">
          ${categoryTable.clues[j].question} "Answer:" ${categoryTable.clues[j].answer}!
        </tr>`);
      categoryArray.push(categoryTable.clues[j].question);
    }

    jTable.push(categoryArray);
  }

  console.log(jTable);
}

$("button#start").on("click", async function (e) {
  if (questions.length > 0) {
    $("div").remove();
    questions.length = 0;
    answers.length = 0;
  }

  const random = await axios.get("http://jservice.io/api/random");
  questions.push(random.data[0].question);
  answers.push(random.data[0].answer);

  const type = $("input").val();
  getRandom(type);
});

$("button#load-game").on("click", function (e) {
  $("div").remove();
  $("body").append("<div class=jeopardy-table></div>");
  const tableContainer = $(".jeopardy-table");

  const tableHTML = $("<table id='jeopardy'></table>");

  for (const category of categories) {
    const categoryHTML = `
      <div class="category">
        <div class="category-title">${category.title} Questions!</div>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>${category.title}</th>
              </tr>
            </thead>
            <tbody>
              ${category.clues
                .map(
                  (clue) => `
                    <tr class="qanda">
                      <td class="question">${clue.question}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
    tableContainer.append(categoryHTML);
  }
  
  $("div.jeopardy-table").on("click", "tr", function (e) {
    const question = $(this).find(".question").text();
    const category = categories.find((cat) =>
      cat.clues.some((cl) => cl.question === question)
    );
    const clue = category.clues.find((cl) => cl.question === question);
    console.log(question);
    console.log(clue && clue.answer);
    $(this).find(".question").text(question + " " + (clue && clue.answer))
  });
});
