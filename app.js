// constants
const BASE_URL = "https://6665b316d122c2868e417539.mockapi.io/api/v1";

// variables
const tableBody = document.querySelector("#tableBody");
const formElement = document.querySelector("form");
const modalTitle = document.querySelector("#exampleModalLabel");
const btnSubmit = document.querySelector("#btnSubmit");
const btnCloseModal = document.querySelector("#btnCloseModal");
let courses = [];

// ---------- fetch all courses ---------- //
const generateTableRow = ({ id, name, slug, desc }) => {
  return `
      <tr>
        <th scope="row">${id}</th>
        <td>${name}</td>
        <td>${slug}</td>
        <td>${desc}</td>
        <td>
          <button class="btn btn-success" onclick="clickEditButton(${id})" data-toggle="modal" data-target="#exampleModal">Edit</button>
          <button class="btn btn-danger" onclick="clickDeleteButton(${id})">Delete</button>
        </td>
      </tr>
    `;
};

const renderCourses = () => {
  tableBody.innerHTML = "";
  courses
    .sort((a, b) => b.id - a.id)
    .map((course) => {
      tableBody.innerHTML += generateTableRow(course);
    });
};

const getAllCourses = async () => {
  const { data } = await axios.get(`${BASE_URL}/courses`);
  courses = data;
  renderCourses();
};

window.addEventListener("DOMContentLoaded", getAllCourses);

// ---------- create or edit course ---------- //
const changeModal = (data = null) => {
  const formState = formElement.getAttribute("data-state");
  if (formState === "edit") {
    modalTitle.textContent = "Edit Course";
    btnSubmit.textContent = "Update";
  } else {
    modalTitle.textContent = "Create Course";
    btnSubmit.textContent = "Create";
  }
  formElement.courseName.value = data?.name ? data.name : "";
  formElement.courseSlug.value = data?.slug ? data.slug : "";
  formElement.courseDesc.value = data?.desc ? data.desc : "";
  formElement["course-id"].value = data?.id ? data.id : "";
};

const clickEditButton = (id) => {
  const data = courses.find((course) => parseInt(course.id) === id);
  formElement.setAttribute("data-state", "edit");
  changeModal(data);
};
const clickCreateButton = () => {
  formElement.setAttribute("data-state", "create");
  changeModal();
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const formState = e.target.getAttribute("data-state");

  const id = formElement["course-id"].value;
  const name = formElement.courseName.value;
  const slug = formElement.courseSlug.value;
  const desc = formElement.courseDesc.value;
  const data = { name, slug, desc };

  if (!name || !slug) {
    alert("❌ Sorry, name & slug are required!");
    return;
  }

  if (formState === "edit") {
    await axios.put(`${BASE_URL}/courses/${id}`, data);

    courses = courses.map((course) => {
      if (course.id === id) {
        return { id, ...data };
      }
      return course;
    });
    renderCourses();

    btnCloseModal.click();
    alert("✅ Course update was successful");
  } else {
    const course = await axios.post(`${BASE_URL}/courses`, data);
    courses.push({ id: course.data.id, ...data });
    renderCourses();
    btnCloseModal.click();
    alert("🎉 Created new course was successfully");
  }
};

formElement.addEventListener("submit", handleSubmit);

// ---------- delete course ---------- //
const clickDeleteButton = async (id) => {
  const result = confirm("⚠️ Are you sure?");
  if (!result) return;

  await axios.delete(`${BASE_URL}/courses/${id}`);
  courses = courses.filter((course) => parseInt(course.id) !== id);
  renderCourses();
  alert("✅ Course delete was successful");
};
