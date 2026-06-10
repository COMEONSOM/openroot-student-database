// ============================================================
// script.js — Student Database System
// Production Grade Validation + Dynamic India Geo Dropdowns
// Includes:
// - Add Student
// - Search & Update Student
// - Database Viewer
// ============================================================

const API_BASE =
    "https://openroot-student-management-system-api.onrender.com";

const API = {
    addStudent: `${API_BASE}/api/add-student`,
    addCourse: `${API_BASE}/api/add-course`,
    fullDatabase: `${API_BASE}/api/full-database`,

    searchStudentByMobile: (m) =>
        `${API_BASE}/api/student/${encodeURIComponent(m)}`,

    updateStudentByMobile: (m) =>
        `${API_BASE}/api/student/${encodeURIComponent(m)}`,

    deleteStudentByMobile: (m) =>
        `${API_BASE}/api/student/${encodeURIComponent(m)}`
};

// ============================================================
// INDIA GEO DATA
// ============================================================

let INDIA_GEO_DATA = [];
let UPDATE_GEO_DATA = [];
let UPDATE_PENDING_ADDRESS = "";
let UPDATE_ORIGINAL_MOBILE = "";

// ============================================================
// DATABASE VIEWER STATE
// ============================================================

let DATABASE_RECORDS = [];
let DATABASE_FILTERED_RECORDS = [];

// ============================================================
// LOAD INDIA JSON
// ============================================================

async function loadIndiaGeoData() {
    try {
        const response = await fetch("./static/indiaGeoData.json");

        if (!response.ok) {
            throw new Error("Failed to load indiaGeoData.json");
        }

        INDIA_GEO_DATA = await response.json();
        initializeAddressDropdowns();
    } catch (error) {
        console.error("Geo Data Load Error:", error);
    }
}

async function loadUpdateGeoData() {
    try {
        const response = await fetch("./static/indiaGeoData.json");

        if (!response.ok) {
            throw new Error("Failed to load indiaGeoData.json");
        }

        UPDATE_GEO_DATA = await response.json();

        const stateEl = document.getElementById("update_state");
        const districtEl = document.getElementById("update_district");
        const acEl = document.getElementById("update_assembly_constituency");

        if (stateEl && districtEl && acEl) {
            fillSelect(stateEl, getUpdateStates(), "Select State");
            districtEl.disabled = true;
            acEl.disabled = true;
        }

        if (UPDATE_PENDING_ADDRESS) {
            syncUpdateDropdownsFromParsedAddress(
                parseCombinedAddress(UPDATE_PENDING_ADDRESS)
            );
            UPDATE_PENDING_ADDRESS = "";
        }
    } catch (error) {
        console.error("Geo Data Load Error:", error);
    }
}

// ============================================================
// DOM HELPERS
// ============================================================

function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
}

function getChecked(id) {
    const el = document.getElementById(id);
    return el ? el.checked : false;
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.value = value ?? "";
    }
}

function showElement(id) {
    const el = document.getElementById(id);
    if (el) {
        el.style.display = "block";
    }
}

function hideElement(id) {
    const el = document.getElementById(id);
    if (el) {
        el.style.display = "none";
    }
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

// ============================================================
// FORMATTERS
// ============================================================

function normalizeMobile(mobile) {
    return String(mobile || "").replace(/\D/g, "");
}

function formatINR(value) {
    if (value == null || value === "") return "—";

    const number = Number(value);
    if (Number.isNaN(number)) return "—";

    return "₹" + number.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatPaidStatus(value) {
    return value ? "Paid" : "Not Paid";
}

// ============================================================
// VALIDATIONS
// ============================================================

function isValidEnglishName(value) {
    return /^[A-Za-z ]{1,60}$/.test(String(value || "").trim());
}

function isValidEmail(value) {
    const text = String(value || "").trim();
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(text);
}

function isValidMoney(value) {
    return /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(String(value || "").trim());
}

function isValidPinCode(value) {
    return /^\d{6}$/.test(String(value || "").trim());
}

function isAtLeast18(dobValue) {
    if (!dobValue) return false;

    const dob = new Date(dobValue);
    if (Number.isNaN(dob.getTime())) return false;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDifference = today.getMonth() - dob.getMonth();

    if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < dob.getDate())
    ) {
        age--;
    }

    return age >= 18;
}

function isNotFuture(dateValue) {
    if (!dateValue) return false;

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    return date <= today;
}

function vf(id, ok, errId) {
    const el = document.getElementById(id);
    const err = errId ? document.getElementById(errId) : null;

    if (el) {
        el.classList.toggle("error", !ok);
    }

    if (err) {
        err.style.display = ok ? "none" : "block";
    }

    return ok;
}

// ============================================================
// FEES TOGGLE UI
// ============================================================

function initializeFeesToggle() {
    const toggle = document.getElementById("fees_paid");
    const toggleRow = document.getElementById("toggleRow");
    const toggleLabel = document.getElementById("toggleLabel");

    if (!toggle || !toggleRow || !toggleLabel) return;

    function updateUI() {
        if (toggle.checked) {
            toggleRow.classList.add("paid");
            toggleLabel.textContent = "Fees Paid";
        } else {
            toggleRow.classList.remove("paid");
            toggleLabel.textContent = "Fees Not Paid";
        }
    }

    updateUI();
    toggle.addEventListener("change", updateUI);
}

function initializeUpdateFeesToggle() {
    const feesPaid = document.getElementById("update_fees_paid");
    const toggleRow = document.getElementById("updateToggleRow");
    const toggleLabel = document.getElementById("updateToggleLabel");

    if (!feesPaid || !toggleRow || !toggleLabel) return;

    function updateUI() {
        toggleRow.classList.toggle("paid", feesPaid.checked);
        toggleLabel.textContent = feesPaid.checked ? "Fees Paid" : "Fees Not Paid";
    }

    updateUI();
    feesPaid.addEventListener("change", updateUI);
}

// ============================================================
// ADDRESS DATA HELPERS
// ============================================================

function getStates() {
    return [...new Set(INDIA_GEO_DATA.map(item => item.state))].sort();
}

function getDistrictsByState(stateName) {
    const stateEntry = INDIA_GEO_DATA.find(item => item.state === stateName);
    return stateEntry ? [...stateEntry.districts].sort() : [];
}

function getACsByState(stateName) {
    const stateEntry = INDIA_GEO_DATA.find(item => item.state === stateName);

    if (!stateEntry || !stateEntry.assembly_constituencies) {
        return [];
    }

    return [
        ...new Set(
            stateEntry.assembly_constituencies
                .map(ac => ac.assembly_constituency_name)
                .filter(Boolean)
        )
    ].sort();
}

function getUpdateStateEntries() {
    return Array.isArray(UPDATE_GEO_DATA) ? UPDATE_GEO_DATA : [];
}

function getUpdateStates() {
    return [...new Set(getUpdateStateEntries().map(item => item.state))].sort();
}

function getUpdateDistrictsByState(stateName) {
    const stateEntry = getUpdateStateEntries().find(item => item.state === stateName);
    return stateEntry ? [...stateEntry.districts].sort() : [];
}

function getUpdateACsByState(stateName) {
    const stateEntry = getUpdateStateEntries().find(item => item.state === stateName);

    if (!stateEntry || !Array.isArray(stateEntry.assembly_constituencies)) {
        return [];
    }

    return [
        ...new Set(
            stateEntry.assembly_constituencies
                .map(ac => ac.assembly_constituency_name)
                .filter(Boolean)
        )
    ].sort();
}

// ============================================================
// SELECT HELPER
// ============================================================

function fillSelect(selectElement, items, placeholder) {
    if (!selectElement) return;

    selectElement.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = placeholder;
    selectElement.appendChild(defaultOption);

    items.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        selectElement.appendChild(option);
    });
}

// ============================================================
// ADDRESS DROPDOWNS
// ============================================================

function initializeAddressDropdowns() {
    const stateEl = document.getElementById("state");
    const districtEl = document.getElementById("district");
    const acEl = document.getElementById("assembly_constituency");

    if (!stateEl || !districtEl || !acEl) return;

    fillSelect(stateEl, getStates(), "Select State");
    districtEl.disabled = true;
    acEl.disabled = true;

    stateEl.addEventListener("change", function () {
        const selectedState = this.value;

        fillSelect(districtEl, [], "Select District");
        fillSelect(acEl, [], "Select Assembly Constituency");

        districtEl.disabled = true;
        acEl.disabled = true;

        if (!selectedState) return;

        const districts = getDistrictsByState(selectedState);
        fillSelect(districtEl, districts, "Select District");
        districtEl.disabled = false;
    });

    districtEl.addEventListener("change", function () {
        const selectedState = stateEl.value;
        const selectedDistrict = this.value;

        fillSelect(acEl, [], "Select Assembly Constituency");
        acEl.disabled = true;

        if (!selectedState || !selectedDistrict) return;

        const acs = getACsByState(selectedState);
        fillSelect(acEl, acs, "Select Assembly Constituency");
        acEl.disabled = false;
    });
}

function initializeUpdateAddressHandlers() {
    const stateEl = document.getElementById("update_state");
    const districtEl = document.getElementById("update_district");
    const acEl = document.getElementById("update_assembly_constituency");
    const pinEl = document.getElementById("update_pincode");

    if (!stateEl || !districtEl || !acEl || !pinEl) return;

    stateEl.addEventListener("change", function () {
        const districts = getUpdateDistrictsByState(this.value);

        fillSelect(districtEl, districts, "Select District");
        districtEl.disabled = !districts.length;

        fillSelect(acEl, [], "Select Assembly Constituency");
        acEl.disabled = true;

        rebuildUpdateAddress();
    });

    districtEl.addEventListener("change", function () {
        const acs = getUpdateACsByState(stateEl.value);

        fillSelect(acEl, acs, "Select Assembly Constituency");
        acEl.disabled = !acs.length;

        rebuildUpdateAddress();
    });

    acEl.addEventListener("change", rebuildUpdateAddress);

    pinEl.addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "").slice(0, 6);
        rebuildUpdateAddress();
    });
}

// ============================================================
// BUILD ADDRESS
// ============================================================

function buildCombinedAddress() {
    const state = getValue("state");
    const district = getValue("district");
    const ac = getValue("assembly_constituency");
    const pincode = getValue("pincode");

    if (!state || !district || !ac || !isValidPinCode(pincode)) {
        return "";
    }

    return `${ac}, ${district}, ${state} - ${pincode}`;
}

// ============================================================
// UPDATE ADDRESS HELPERS
// ============================================================

function parseCombinedAddress(address) {
    const text = String(address || "").trim();
    if (!text) {
        return { ac: "", district: "", state: "", pincode: "" };
    }

    const match = text.match(/^(.*),\s*(.*),\s*(.*)\s*-\s*(\d{6})$/);
    if (!match) {
        return { ac: "", district: "", state: "", pincode: "" };
    }

    return {
        ac: match[1].trim(),
        district: match[2].trim(),
        state: match[3].trim(),
        pincode: match[4].trim()
    };
}

function rebuildUpdateAddress() {
    const state = getValue("update_state");
    const district = getValue("update_district");
    const ac = getValue("update_assembly_constituency");
    const pincode = getValue("update_pincode");

    const hidden = document.getElementById("update_hidden_address");
    const display = document.getElementById("update_address");

    const combined =
        state && district && ac && isValidPinCode(pincode)
            ? `${ac}, ${district}, ${state} - ${pincode}`
            : "";

    if (hidden) hidden.value = combined;
    if (display) display.value = combined;

    return combined;
}

function syncUpdateDropdownsFromParsedAddress(parsed) {
    const stateEl = document.getElementById("update_state");
    const districtEl = document.getElementById("update_district");
    const acEl = document.getElementById("update_assembly_constituency");
    const pinEl = document.getElementById("update_pincode");

    if (!stateEl || !districtEl || !acEl || !pinEl) return;
    if (!parsed || !parsed.state) return;

    stateEl.value = parsed.state;

    const districts = getUpdateDistrictsByState(parsed.state);
    fillSelect(districtEl, districts, "Select District");
    districtEl.disabled = !districts.length;
    districtEl.value = parsed.district || "";

    const acs = getUpdateACsByState(parsed.state);
    fillSelect(acEl, acs, "Select Assembly Constituency");
    acEl.disabled = !acs.length;
    acEl.value = parsed.ac || "";

    pinEl.value = parsed.pincode || "";
    rebuildUpdateAddress();
}

// ============================================================
// MESSAGE BOX
// ============================================================

function showMsg(elementId, type, text) {
    const box = document.getElementById(elementId);
    if (!box) return;

    box.className = "msg-box " + type;
    box.innerHTML = text;
    box.style.display = "flex";
}

function hideMsg(elementId) {
    const box = document.getElementById(elementId);
    if (!box) return;

    box.className = "msg-box";
    box.innerHTML = "";
    box.style.display = "none";
}

// ============================================================
// FETCH WRAPPER
// ============================================================

async function fetchJSON(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    let data = null;

    try {
        data = await response.json();
    } catch {
        throw new Error("Server returned an invalid response.");
    }

    if (!response.ok) {
        throw new Error(data?.message || "Something went wrong.");
    }

    return data;
}

// ============================================================
// ADD STUDENT
// ============================================================

function handleAddStudent() {
    const form = document.getElementById("studentForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const student_name = getValue("student_name");
        const date_of_birth = getValue("date_of_birth");
        const mobile_number = normalizeMobile(getValue("mobile_number")).slice(0, 10);
        const email = getValue("email");
        const enrollment_date = getValue("enrollment_date");
        const address = buildCombinedAddress();
        const course_name = getValue("course_name");
        const fees_structure = getValue("fees_structure");
        const course_duration = getValue("course_duration");
        const course_start_date = getValue("course_start_date");
        const course_end_date = getValue("course_end_date");

        let valid = true;

        if (!isValidEnglishName(student_name)) valid = false;
        if (!isAtLeast18(date_of_birth)) valid = false;
        if (!/^[0-9]{10}$/.test(mobile_number)) valid = false;
        if (!isValidEmail(email)) valid = false;
        if (!isNotFuture(enrollment_date)) valid = false;
        if (!course_name) valid = false;
        if (!isValidMoney(fees_structure)) valid = false;
        if (!address) valid = false;
        if (course_start_date && course_end_date && course_start_date >= course_end_date) valid = false;

        if (!valid) {
            showMsg("messageBox", "error", "Please fix all highlighted fields.");
            return;
        }

        showMsg("messageBox", "loading", "Saving student and course details...");

        const payload = {
            student_name,
            date_of_birth,
            mobile_number,
            email,
            enrollment_date,
            address,
            state: getValue("state"),
            district: getValue("district"),
            assembly_constituency: getValue("assembly_constituency"),
            pincode: getValue("pincode"),
            course_name,
            fees_structure,
            fees_paid: getChecked("fees_paid") ? 1 : 0,
            course_duration: course_duration || null,
            course_start_date: course_start_date || null,
            course_end_date: course_end_date || null
        };

        try {
            const result = await fetchJSON(API.addStudent, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            showMsg(
                "messageBox",
                "success",
                `Student saved successfully. Enrollment No: ${escapeHTML(result.enrollment_no || "")}`
            );

            form.reset();
        } catch (error) {
            showMsg("messageBox", "error", error.message);
        }
    });
}

// ============================================================
// SEARCH + UPDATE STUDENT
// ============================================================

function populateUpdateForm(student, course) {
    const updateContainer = document.getElementById("updateContainer");
    const foundName = document.getElementById("foundName");

    if (!student) {
        showMsg("searchMessageBox", "error", "No student found with this mobile number.");
        if (updateContainer) updateContainer.style.display = "none";
        return;
    }

    if (updateContainer) updateContainer.style.display = "block";
    if (foundName) foundName.textContent = student.student_name || "";

    setValue("update_enrollment_no", student.enrollment_no || "");
    setValue("update_student_name", student.student_name || "");
    setValue("update_date_of_birth", student.date_of_birth || "");
    setValue("update_mobile_number", student.mobile_number || "");
    setValue("update_email", student.email || "");
    setValue("update_enrollment_date", student.enrollment_date || "");

    UPDATE_ORIGINAL_MOBILE = normalizeMobile(student.mobile_number);

    const address = student.address || "";
    setValue("update_address", address);
    setValue("update_hidden_address", address);

    if (UPDATE_GEO_DATA.length) {
        syncUpdateDropdownsFromParsedAddress(parseCombinedAddress(address));
    } else {
        UPDATE_PENDING_ADDRESS = address;
    }

    if (course) {
        setValue("update_course_id", course.course_id || "");
        setValue("update_course_name", course.course_name || "");
        setValue("update_fees_structure", course.fees_structure || "");
        setValue("update_course_duration", course.course_duration || "");
        setValue("update_course_start_date", course.course_start_date || "");
        setValue("update_course_end_date", course.course_end_date || "");

        const paid = !!course.fees_paid;
        const updateFeesPaid = document.getElementById("update_fees_paid");
        const updateToggleRow = document.getElementById("updateToggleRow");
        const updateToggleLabel = document.getElementById("updateToggleLabel");

        if (updateFeesPaid) updateFeesPaid.checked = paid;
        if (updateToggleRow) updateToggleRow.classList.toggle("paid", paid);
        if (updateToggleLabel) updateToggleLabel.textContent = paid ? "Fees Paid" : "Fees Not Paid";
    }

    if (updateContainer) {
        updateContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    showMsg(
        "searchMessageBox",
        "success",
        `Student <strong>${escapeHTML(student.student_name || "")}</strong> found. Edit the details below.`
    );
}

function cancelUpdate() {
    const updateContainer = document.getElementById("updateContainer");
    if (updateContainer) updateContainer.style.display = "none";

    setValue("search_mobile_number", "");
    hideMsg("searchMessageBox");
}

async function searchStudent(mobile, cb) {
    const result = await fetchJSON(API.searchStudentByMobile(mobile));
    cb(result.student || null, result.course || null);
}

async function updateStudent(payload) {
    const mobile = UPDATE_ORIGINAL_MOBILE || normalizeMobile(payload?.student?.mobile_number);

    const result = await fetchJSON(API.updateStudentByMobile(mobile), {
        method: "PUT",
        body: JSON.stringify({
            student_name: payload.student.student_name,
            date_of_birth: payload.student.date_of_birth,
            mobile_number: payload.student.mobile_number,
            email: payload.student.email,
            enrollment_date: payload.student.enrollment_date,
            address: payload.student.address,
            state: getValue("update_state"),
            district: getValue("update_district"),
            assembly_constituency: getValue("update_assembly_constituency"),
            pincode: getValue("update_pincode"),
            course_id: payload.course.course_id,
            course_name: payload.course.course_name,
            fees_structure: payload.course.fees_structure,
            fees_paid: payload.course.fees_paid ? 1 : 0,
            course_duration: payload.course.course_duration,
            course_start_date: payload.course.course_start_date,
            course_end_date: payload.course.course_end_date
        })
    });

    showMsg("updateMessageBox", "success", result.message || "Updated successfully.");
    return result;
}

function handleUpdateStudentSearch() {
    const searchForm = document.getElementById("searchStudentForm");
    if (!searchForm) return;

    searchForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const mobile = normalizeMobile(getValue("search_mobile_number")).slice(0, 10);

        if (!vf("search_mobile_number", /^[0-9]{10}$/.test(mobile), "err_search_mobile")) {
            return;
        }

        showMsg("searchMessageBox", "info", "Searching…");

        try {
            await searchStudent(mobile, populateUpdateForm);
        } catch (error) {
            showMsg("searchMessageBox", "error", error.message);

            const updateContainer = document.getElementById("updateContainer");
            if (updateContainer) updateContainer.style.display = "none";
        }
    });
}

function handleUpdateStudentForm() {
    const updateForm = document.getElementById("updateStudentForm");
    if (!updateForm) return;

    updateForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const name = getValue("update_student_name");
        const dob = getValue("update_date_of_birth");
        const mobile = normalizeMobile(getValue("update_mobile_number")).slice(0, 10);
        const email = getValue("update_email");
        const enrollDate = getValue("update_enrollment_date");
        const courseName = getValue("update_course_name");
        const fees = getValue("update_fees_structure");
        const courseId = getValue("update_course_id");
        const duration = getValue("update_course_duration");
        const startDate = getValue("update_course_start_date");
        const endDate = getValue("update_course_end_date");
        const address = rebuildUpdateAddress();

        let valid = true;

        valid = vf("update_student_name", isValidEnglishName(name), "err_upd_name") && valid;
        valid = vf("update_date_of_birth", isAtLeast18(dob), "err_upd_dob") && valid;
        valid = vf("update_mobile_number", /^[0-9]{10}$/.test(mobile), "err_upd_mobile") && valid;
        valid = vf("update_email", isValidEmail(email), "err_upd_email") && valid;
        valid = vf("update_enrollment_date", isNotFuture(enrollDate), "err_upd_enroll") && valid;
        valid = vf("update_course_name", Boolean(courseName), "err_upd_course") && valid;
        valid = vf("update_fees_structure", isValidMoney(fees), "err_upd_fees") && valid;
        valid = vf("update_pincode", isValidPinCode(getValue("update_pincode")), "err_upd_pincode") && valid;
        valid = vf("update_address", Boolean(address), null) && valid;

        const startDateEl = document.getElementById("update_course_start_date");
        const errDates = document.getElementById("err_upd_dates");

        if (startDate && endDate && startDate >= endDate) {
            if (startDateEl) startDateEl.classList.add("error");
            if (errDates) errDates.style.display = "block";
            valid = false;
        } else {
            if (startDateEl) startDateEl.classList.remove("error");
            if (errDates) errDates.style.display = "none";
        }

        if (!valid) {
            showMsg("updateMessageBox", "error", "Please fix the highlighted fields.");
            return;
        }

        showMsg("updateMessageBox", "info", "Saving changes…");

        try {
            await updateStudent({
                enrollment_no: getValue("update_enrollment_no"),
                student: {
                    student_name: name,
                    date_of_birth: dob,
                    mobile_number: mobile,
                    email,
                    address,
                    enrollment_date: enrollDate
                },
                course: {
                    course_id: courseId ? parseInt(courseId, 10) : null,
                    course_name: courseName,
                    fees_structure: fees,
                    fees_paid: getChecked("update_fees_paid"),
                    course_duration: duration || null,
                    course_start_date: startDate || null,
                    course_end_date: endDate || null
                }
            });

            showMsg("updateMessageBox", "success", "Student and course details updated successfully.");
        } catch (error) {
            showMsg("updateMessageBox", "error", error.message);
        }
    });
}

// ============================================================
// DATABASE VIEWER
// ============================================================

function getDatabaseTableElements() {
    return {
        tableBody: document.getElementById("databaseTableBody"),
        searchInput: document.getElementById("recordSearch"),
        refreshBtn: document.getElementById("refreshDatabaseBtn"),
        countEl: document.getElementById("recordCount")
    };
}

function buildDatabaseSearchText(record) {
    return [
        record.enrollment_no,
        record.student_name,
        record.mobile_number,
        record.email,
        record.course_name,
        record.fees_structure,
        record.course_duration,
        record.address
    ]
        .map(value => String(value || "").toLowerCase())
        .join(" ");
}

function renderDatabaseRows(records) {
    const { tableBody, countEl } = getDatabaseTableElements();
    if (!tableBody) return;

    if (countEl) {
        countEl.textContent = `${records.length} ${records.length === 1 ? "row" : "rows"}`;
    }

    if (!Array.isArray(records) || records.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <p>No records found.</p>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = records.map(record => `
        <tr>
            <td>${escapeHTML(record.enrollment_no || "—")}</td>
            <td>${escapeHTML(record.student_name || "—")}</td>
            <td>${escapeHTML(record.mobile_number || "—")}</td>
            <td>${escapeHTML(record.email || "—")}</td>
            <td>${escapeHTML(record.course_name || "—")}</td>
            <td>${escapeHTML(formatINR(record.fees_structure))}</td>
            <td>${escapeHTML(formatPaidStatus(!!record.fees_paid))}</td>
            <td>${escapeHTML(record.course_duration || "—")}</td>
        </tr>
    `).join("");
}

function renderDatabaseLoading() {
    const { tableBody, countEl } = getDatabaseTableElements();
    if (countEl) countEl.textContent = "0 rows";
    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>
            <td colspan="8" class="empty-state">
                <p>Loading database records...</p>
            </td>
        </tr>
    `;
}

function renderDatabaseError(message) {
    const { tableBody, countEl } = getDatabaseTableElements();
    if (countEl) countEl.textContent = "0 rows";
    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>
            <td colspan="8" class="empty-state">
                <p>${escapeHTML(message || "Failed to load database records.")}</p>
            </td>
        </tr>
    `;
}

async function loadDatabaseRecords() {
    const { tableBody } = getDatabaseTableElements();
    if (!tableBody) return;

    renderDatabaseLoading();

    try {
        const result = await fetchJSON(API.fullDatabase);

        DATABASE_RECORDS = Array.isArray(result.records) ? result.records : [];
        DATABASE_FILTERED_RECORDS = [...DATABASE_RECORDS];

        renderDatabaseRows(DATABASE_FILTERED_RECORDS);
    } catch (error) {
        console.error("Database Load Error:", error);
        renderDatabaseError(error.message || "Failed to load database records.");
    }
}

function filterDatabaseRecords(query) {
    const term = String(query || "").trim().toLowerCase();

    if (!term) {
        DATABASE_FILTERED_RECORDS = [...DATABASE_RECORDS];
    } else {
        DATABASE_FILTERED_RECORDS = DATABASE_RECORDS.filter(record =>
            buildDatabaseSearchText(record).includes(term)
        );
    }

    renderDatabaseRows(DATABASE_FILTERED_RECORDS);
}

function initializeDatabaseViewer() {
    const { tableBody, searchInput, refreshBtn } = getDatabaseTableElements();
    if (!tableBody) return;

    loadDatabaseRecords();

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            filterDatabaseRecords(this.value);
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener("click", function () {
            loadDatabaseRecords();
        });
    }
}

// ============================================================
// INPUT RESTRICTIONS
// ============================================================

function setupInputRestrictions() {
    const mobile = document.getElementById("mobile_number");
    if (mobile) {
        mobile.addEventListener("input", function () {
            this.value = this.value.replace(/\D/g, "").slice(0, 10);
        });
    }

    const pincode = document.getElementById("pincode");
    if (pincode) {
        pincode.addEventListener("input", function () {
            this.value = this.value.replace(/\D/g, "").slice(0, 6);
        });
    }

    const name = document.getElementById("student_name");
    if (name) {
        name.addEventListener("input", function () {
            this.value = this.value.replace(/[^A-Za-z ]/g, "").slice(0, 60);
        });
    }

    const fees = document.getElementById("fees_structure");
    if (fees) {
        fees.addEventListener("input", function () {
            this.value = this.value.replace(/[^0-9.]/g, "");

            const parts = this.value.split(".");
            if (parts.length > 2) {
                this.value = `${parts[0]}.${parts.slice(1).join("")}`;
            }

            const nextParts = this.value.split(".");
            if (nextParts[1] && nextParts[1].length > 2) {
                this.value = `${nextParts[0]}.${nextParts[1].slice(0, 2)}`;
            }
        });

        fees.addEventListener("keydown", function (event) {
            if (["e", "E", "+", "-"].includes(event.key)) {
                event.preventDefault();
            }
        });
    }
}

function setupUpdateInputRestrictions() {
    const restrictedFields = [
        "search_mobile_number",
        "update_mobile_number",
        "update_pincode"
    ];

    restrictedFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", function () {
                this.value = this.value
                    .replace(/\D/g, "")
                    .slice(0, id === "update_pincode" ? 6 : 10);
            });
        }
    });

    const nameEl = document.getElementById("update_student_name");
    if (nameEl) {
        nameEl.addEventListener("input", function () {
            this.value = this.value.replace(/[^A-Za-z ]/g, "").slice(0, 60);
        });
    }

    const feeEl = document.getElementById("update_fees_structure");
    if (feeEl) {
        feeEl.addEventListener("input", function () {
            this.value = this.value.replace(/[^0-9.]/g, "");

            const parts = this.value.split(".");
            if (parts.length > 2) {
                this.value = `${parts[0]}.${parts.slice(1).join("")}`;
            }

            const nextParts = this.value.split(".");
            if (nextParts[1] && nextParts[1].length > 2) {
                this.value = `${nextParts[0]}.${nextParts[1].slice(0, 2)}`;
            }
        });

        feeEl.addEventListener("keydown", function (event) {
            if (["e", "E", "+", "-"].includes(event.key)) {
                event.preventDefault();
            }
        });
    }
}

// ============================================================
// INIT
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
    setupInputRestrictions();
    setupUpdateInputRestrictions();

    initializeFeesToggle();
    initializeUpdateFeesToggle();

    handleAddStudent();
    handleUpdateStudentSearch();
    handleUpdateStudentForm();
    initializeUpdateAddressHandlers();
    initializeDatabaseViewer();

    await Promise.all([
        loadIndiaGeoData(),
        loadUpdateGeoData()
    ]);

    const enrollment = document.getElementById("enrollment_date");
    if (enrollment) {
        enrollment.valueAsDate = new Date();
    }

    const dob = document.getElementById("date_of_birth");
    if (dob) {
        const maxDob = new Date();
        maxDob.setFullYear(maxDob.getFullYear() - 18);
        dob.max = maxDob.toISOString().split("T")[0];
    }
});

// expose inline handler
window.cancelUpdate = cancelUpdate;

// ============================================================
// DELETE STUDENT SUPPORT
// ============================================================

window.searchStudent = async function (mobile, cb) {

    try {

        const normalizedMobile =
            normalizeMobile(mobile).slice(0, 10);

        if (
            !/^[0-9]{10}$/
                .test(normalizedMobile)
        ) {

            throw new Error(
                "Please enter a valid 10-digit mobile number."
            );
        }

        const result =
            await fetchJSON(
                API.searchStudentByMobile(
                    normalizedMobile
                )
            );

        const student =
            result.student || null;

        const course =
            result.course || null;

        if (!student) {

            throw new Error(
                "No student found with this mobile number."
            );
        }

        // DELETE PAGE SUPPORT
        if (typeof cb === "function") {

            // delete page callback
            if (cb.length <= 1) {

                cb({
                    ...student,
                    course
                });

            } else {

                // update page callback
                cb(student, course);
            }
        }

        return result;

    } catch (error) {

        console.error(
            "Search Student Error:",
            error
        );

        throw error;
    }
};

// ============================================================
// DELETE STUDENT FUNCTION
// ============================================================

window.deleteStudent = async function (
    mobileNumber,
    studentName
) {

    try {

        const normalizedMobile =
            normalizeMobile(mobileNumber)
                .slice(0, 10);

        if (
            !/^[0-9]{10}$/
                .test(normalizedMobile)
        ) {

            throw new Error(
                "Invalid mobile number."
            );
        }

        showMsg(
            "deleteMessageBox",
            "loading",
            `
            Deleting
            <strong>${escapeHTML(studentName)}</strong>
            ...
            `
        );

        const response =
            await fetch(
                API.deleteStudentByMobile(
                    normalizedMobile
                ),
                {
                    method: "DELETE"
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to delete student."
            );
        }

        showMsg(
            "deleteMessageBox",
            "success",
            `
            <strong>${escapeHTML(studentName)}</strong>
            has been deleted successfully.
            `
        );

        hideElement("studentPreview");

    } catch (error) {

        console.error(
            "Delete Student Error:",
            error
        );

        showMsg(
            "deleteMessageBox",
            "error",
            error.message ||
            "Failed to delete student."
        );
    }
};

// ============================================================
// DELETE PAGE INPUT RESTRICTION
// ============================================================

(function initializeDeleteInputRestriction() {

    const deleteMobileInput =
        document.getElementById(
            "delete_mobile_number"
        );

    if (!deleteMobileInput) return;

    deleteMobileInput.addEventListener(
        "input",
        function () {

            this.value =
                this.value
                    .replace(/\D/g, "")
                    .slice(0, 10);
        }
    );

})();