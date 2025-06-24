// ComplaintHub - Complete JavaScript Application

// Global Variables
let currentUser = null
let allComplaints = []
let filteredComplaints = []
let currentComplaintForEdit = null
let currentComplaintId = null
let showMyComplaints = false
const bootstrap = window.bootstrap // Declare the bootstrap variable

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

function initializeApp() {
  loadUserFromStorage()
  initializeSampleData()
  updateNavigation()
  showPage("home")
  setupEventListeners()
}

// Page Management
function showPage(pageName) {
  // Hide all pages
  const pages = document.querySelectorAll(".page")
  pages.forEach((page) => (page.style.display = "none"))

  // Update navigation
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link")
  navLinks.forEach((link) => link.classList.remove("active"))

  // Show selected page
  const targetPage = document.getElementById(pageName + "Page")
  if (targetPage) {
    targetPage.style.display = "block"

    // Update active nav link
    const activeNav = document.getElementById("nav-" + pageName)
    if (activeNav) {
      activeNav.classList.add("active")
    }

    // Page-specific initialization
    switch (pageName) {
      case "home":
        updateStats()
        break
      case "submit":
        initializeSubmitForm()
        break
      case "complaints":
        initializeComplaintsPage()
        break
      case "login":
        initializeLoginPage()
        break
      case "register":
        initializeRegisterPage()
        break
      case "admin":
        initializeAdminDashboard()
        break
    }
  }

  // Clear alerts when changing pages
  clearAlerts()
}

// Authentication System
function loadUserFromStorage() {
  const userData = localStorage.getItem("currentUser")
  if (userData) {
    try {
      currentUser = JSON.parse(userData)
    } catch (error) {
      console.error("Error parsing user data:", error)
      localStorage.removeItem("currentUser")
    }
  }
}

function saveUserToStorage() {
  if (currentUser) {
    localStorage.setItem("currentUser", JSON.stringify(currentUser))
  } else {
    localStorage.removeItem("currentUser")
  }
}

async function login(email, password) {
  try {
    await delay(1000)

    const demoUsers = [
      {
        id: 1,
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
      },
      {
        id: 2,
        name: "Regular User",
        email: "user@example.com",
        password: "user123",
        role: "user",
      },
    ]

    const user = demoUsers.find((u) => u.email === email && u.password === password)

    if (user) {
      const { password: _, ...userWithoutPassword } = user
      currentUser = userWithoutPassword
      saveUserToStorage()
      updateNavigation()
      return { success: true, user: currentUser }
    }

    const registeredUsers = getRegisteredUsers()
    const registeredUser = registeredUsers.find((u) => u.email === email && u.password === password)

    if (registeredUser) {
      const { password: _, ...userWithoutPassword } = registeredUser
      currentUser = userWithoutPassword
      saveUserToStorage()
      updateNavigation()
      return { success: true, user: currentUser }
    }

    return { success: false, message: "Invalid email or password" }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, message: "Login failed. Please try again." }
  }
}

async function register(name, email, password) {
  try {
    await delay(1000)

    const registeredUsers = getRegisteredUsers()
    const existingUser = registeredUsers.find((u) => u.email === email)

    if (existingUser) {
      return { success: false, message: "User with this email already exists" }
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      role: "user",
      createdAt: new Date().toISOString(),
    }

    registeredUsers.push(newUser)
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers))

    const { password: _, ...userWithoutPassword } = newUser
    currentUser = userWithoutPassword
    saveUserToStorage()
    updateNavigation()

    return { success: true, user: currentUser }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, message: "Registration failed. Please try again." }
  }
}

function logout() {
  currentUser = null
  saveUserToStorage()
  updateNavigation()
  showPage("home")
}

function getRegisteredUsers() {
  const users = localStorage.getItem("registeredUsers")
  return users ? JSON.parse(users) : []
}

function updateNavigation() {
  const authButtons = document.getElementById("authButtons")
  if (!authButtons) return

  if (currentUser) {
    authButtons.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-primary dropdown-toggle" type="button" 
                        data-bs-toggle="dropdown">
                    <i class="bi bi-person-circle me-1"></i>${currentUser.name}
                </button>
                <ul class="dropdown-menu">
                    ${
                      currentUser.role === "admin"
                        ? '<li><a class="dropdown-item" href="#" onclick="showPage(\'admin\')"><i class="bi bi-shield-check me-2"></i>Admin Dashboard</a></li>'
                        : ""
                    }
                    <li><a class="dropdown-item" href="#" onclick="logout()">
                        <i class="bi bi-box-arrow-right me-2"></i>Logout
                    </a></li>
                </ul>
            </div>
        `
  } else {
    authButtons.innerHTML = `
            <button class="btn btn-outline-primary me-2" onclick="showPage('login')">
                <i class="bi bi-box-arrow-in-right me-1"></i>Login
            </button>
            <button class="btn btn-primary" onclick="showPage('register')">
                <i class="bi bi-person-plus me-1"></i>Register
            </button>
        `
  }
}

function isLoggedIn() {
  return currentUser !== null
}

function isAdmin() {
  return currentUser && currentUser.role === "admin"
}

// Event Listeners Setup
function setupEventListeners() {
  // Submit form
  const complaintForm = document.getElementById("complaintForm")
  if (complaintForm) {
    complaintForm.addEventListener("submit", handleComplaintSubmit)
  }

  // Login form
  const loginForm = document.getElementById("loginForm")
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin)
  }

  // Register form
  const registerForm = document.getElementById("registerForm")
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegistration)
  }

  // Modal update button
  const updateBtn = document.getElementById("updateComplaintBtn")
  if (updateBtn) {
    updateBtn.addEventListener("click", handleComplaintUpdate)
  }
}

// Home Page Functions
function updateStats() {
  const complaints = getComplaints()

  const totalComplaints = complaints.length
  const resolvedComplaints = complaints.filter((c) => c.status === "resolved").length
  const pendingComplaints = complaints.filter((c) => c.status === "pending").length
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0

  animateCounter("totalComplaints", totalComplaints)
  animateCounter("resolvedComplaints", resolvedComplaints)
  animateCounter("pendingComplaints", pendingComplaints)
  animateCounter("resolutionRate", resolutionRate, "%")
}

function animateCounter(elementId, targetValue, suffix = "") {
  const element = document.getElementById(elementId)
  if (!element) return

  let currentValue = 0
  const increment = targetValue / 50
  const timer = setInterval(() => {
    currentValue += increment
    if (currentValue >= targetValue) {
      currentValue = targetValue
      clearInterval(timer)
    }
    element.textContent = Math.floor(currentValue) + suffix
  }, 20)
}

// Submit Complaint Functions
function initializeSubmitForm() {
  const imageUploadArea = document.getElementById("imageUploadArea")
  const imageInput = document.getElementById("image")
  const imagePreview = document.getElementById("imagePreview")
  const removeImageBtn = document.getElementById("removeImage")
  const descriptionTextarea = document.getElementById("description")
  const charCount = document.getElementById("charCount")

  updateAnonymousOptions()

  // Character counter
  if (descriptionTextarea && charCount) {
    descriptionTextarea.addEventListener("input", function () {
      const count = this.value.length
      charCount.textContent = count

      if (count > 1000) {
        charCount.classList.add("text-danger")
        this.value = this.value.substring(0, 1000)
        charCount.textContent = 1000
      } else {
        charCount.classList.remove("text-danger")
      }
    })
  }

  // Image upload handling
  if (imageUploadArea && imageInput) {
    imageUploadArea.addEventListener("click", () => imageInput.click())

    imageUploadArea.addEventListener("dragover", function (e) {
      e.preventDefault()
      this.classList.add("dragover")
    })

    imageUploadArea.addEventListener("dragleave", function (e) {
      e.preventDefault()
      this.classList.remove("dragover")
    })

    imageUploadArea.addEventListener("drop", function (e) {
      e.preventDefault()
      this.classList.remove("dragover")

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleImageFile(files[0])
      }
    })

    imageInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        handleImageFile(e.target.files[0])
      }
    })
  }

  if (removeImageBtn) {
    removeImageBtn.addEventListener("click", () => {
      imageInput.value = ""
      imagePreview.classList.add("d-none")
      imageUploadArea.style.display = "block"
    })
  }
}

function updateAnonymousOptions() {
  const anonymousOption = document.getElementById("anonymousOption")
  const loginNotice = document.getElementById("loginNotice")
  const isAnonymousCheckbox = document.getElementById("isAnonymous")

  if (isLoggedIn()) {
    if (anonymousOption) anonymousOption.style.display = "block"
    if (loginNotice) loginNotice.classList.add("d-none")
    if (isAnonymousCheckbox) isAnonymousCheckbox.checked = false
  } else {
    if (anonymousOption) anonymousOption.style.display = "none"
    if (loginNotice) loginNotice.classList.remove("d-none")
  }
}

function handleImageFile(file) {
  if (!file.type.startsWith("image/")) {
    showAlert("Please select a valid image file.", "danger")
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    showAlert("Image file size must be less than 5MB.", "danger")
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const previewImg = document.getElementById("previewImg")
    const imagePreview = document.getElementById("imagePreview")
    const imageUploadArea = document.getElementById("imageUploadArea")

    if (previewImg && imagePreview && imageUploadArea) {
      previewImg.src = e.target.result
      imagePreview.classList.remove("d-none")
      imageUploadArea.style.display = "none"
    }
  }
  reader.readAsDataURL(file)
}

async function handleComplaintSubmit(e) {
  e.preventDefault()

  const submitBtn = document.getElementById("submitBtn")
  const originalBtnText = submitBtn.innerHTML

  clearAlerts()

  const formData = {
    title: document.getElementById("title").value.trim(),
    category: document.getElementById("category").value,
    description: document.getElementById("description").value.trim(),
    isAnonymous: isLoggedIn() ? document.getElementById("isAnonymous").checked : true,
    image: document.getElementById("image").files[0],
  }

  if (!formData.title || !formData.category || !formData.description) {
    showAlert("Please fill in all required fields.", "danger")
    return
  }

  if (formData.description.length > 1000) {
    showAlert("Description must be less than 1000 characters.", "danger")
    return
  }

  submitBtn.disabled = true
  submitBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
        Submitting...
    `

  try {
    await delay(2000)

    const complaint = {
      id: Date.now(),
      title: formData.title,
      category: formData.category,
      description: formData.description,
      status: "pending",
      isAnonymous: formData.isAnonymous,
      userId: formData.isAnonymous ? null : currentUser?.id,
      userName: formData.isAnonymous ? "Anonymous" : currentUser?.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: formData.image ? URL.createObjectURL(formData.image) : null,
    }

    const complaints = getComplaints()
    complaints.unshift(complaint)
    localStorage.setItem("complaints", JSON.stringify(complaints))

    showAlert("Complaint submitted successfully! You can track its status in the complaints section.", "success")

    document.getElementById("complaintForm").reset()
    document.getElementById("charCount").textContent = "0"
    document.getElementById("imagePreview").classList.add("d-none")
    document.getElementById("imageUploadArea").style.display = "block"

    setTimeout(() => {
      showPage("complaints")
    }, 2000)
  } catch (error) {
    console.error("Submission error:", error)
    showAlert("Failed to submit complaint. Please try again.", "danger")
  } finally {
    submitBtn.disabled = false
    submitBtn.innerHTML = originalBtnText
  }
}

// Complaints List Functions
function initializeComplaintsPage() {
  setupComplaintsEventListeners()
  loadComplaints()
  updateMyComplaintsButton()
}

function setupComplaintsEventListeners() {
  const searchInput = document.getElementById("searchInput")
  const categoryFilter = document.getElementById("categoryFilter")
  const statusFilter = document.getElementById("statusFilter")
  const myComplaintsBtn = document.getElementById("myComplaintsBtn")

  if (searchInput) {
    searchInput.addEventListener("input", debounce(filterComplaints, 300))
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterComplaints)
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", filterComplaints)
  }

  document.querySelectorAll('input[name="sortOrder"]').forEach((radio) => {
    radio.addEventListener("change", filterComplaints)
  })

  if (myComplaintsBtn) {
    myComplaintsBtn.addEventListener("click", toggleMyComplaints)
  }
}

function updateMyComplaintsButton() {
  const myComplaintsBtn = document.getElementById("myComplaintsBtn")
  if (myComplaintsBtn) {
    if (isLoggedIn()) {
      myComplaintsBtn.style.display = "block"
    } else {
      myComplaintsBtn.style.display = "none"
    }
  }
}

async function loadComplaints() {
  const loadingSpinner = document.getElementById("loadingSpinner")
  const complaintsContainer = document.getElementById("complaintsContainer")

  try {
    if (loadingSpinner) loadingSpinner.style.display = "block"
    if (complaintsContainer) complaintsContainer.innerHTML = ""

    await delay(1000)

    allComplaints = getComplaints()

    if (loadingSpinner) loadingSpinner.style.display = "none"

    filterComplaints()
  } catch (error) {
    console.error("Error loading complaints:", error)
    if (loadingSpinner) loadingSpinner.style.display = "none"
    showAlert("Failed to load complaints. Please try again.", "danger")
  }
}

function filterComplaints() {
  const searchInput = document.getElementById("searchInput")
  const categoryFilter = document.getElementById("categoryFilter")
  const statusFilter = document.getElementById("statusFilter")
  const sortOrderChecked = document.querySelector('input[name="sortOrder"]:checked')

  const searchTerm = searchInput ? searchInput.value.toLowerCase() : ""
  const categoryFilterValue = categoryFilter ? categoryFilter.value : ""
  const statusFilterValue = statusFilter ? statusFilter.value : ""
  const sortOrder = sortOrderChecked ? sortOrderChecked.value : "newest"

  filteredComplaints = [...allComplaints]

  if (searchTerm) {
    filteredComplaints = filteredComplaints.filter(
      (complaint) =>
        complaint.title.toLowerCase().includes(searchTerm) ||
        complaint.description.toLowerCase().includes(searchTerm) ||
        complaint.category.toLowerCase().includes(searchTerm),
    )
  }

  if (categoryFilterValue) {
    filteredComplaints = filteredComplaints.filter((complaint) => complaint.category === categoryFilterValue)
  }

  if (statusFilterValue) {
    filteredComplaints = filteredComplaints.filter((complaint) => complaint.status === statusFilterValue)
  }

  if (showMyComplaints && isLoggedIn()) {
    filteredComplaints = filteredComplaints.filter((complaint) => complaint.userId === currentUser.id)
  }

  filteredComplaints.sort((a, b) => {
    const dateA = new Date(a.createdAt)
    const dateB = new Date(b.createdAt)
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB
  })

  updateResultsCount()
  displayComplaints()
}

function updateResultsCount() {
  const resultsCount = document.getElementById("resultsCount")
  if (resultsCount) {
    const total = allComplaints.length
    const filtered = filteredComplaints.length

    if (showMyComplaints) {
      resultsCount.textContent = `Showing ${filtered} of your complaints`
    } else {
      resultsCount.textContent = `Showing ${filtered} of ${total} complaints`
    }
  }
}

function displayComplaints() {
  const complaintsContainer = document.getElementById("complaintsContainer")
  const noResults = document.getElementById("noResults")

  if (!complaintsContainer || !noResults) return

  if (filteredComplaints.length === 0) {
    complaintsContainer.innerHTML = ""
    noResults.classList.remove("d-none")
    return
  }

  noResults.classList.add("d-none")

  const complaintsHTML = filteredComplaints.map((complaint) => createComplaintCard(complaint)).join("")
  complaintsContainer.innerHTML = complaintsHTML
}

function createComplaintCard(complaint) {
  const statusBadge =
    complaint.status === "resolved"
      ? '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Resolved</span>'
      : '<span class="badge bg-warning text-dark"><i class="bi bi-clock me-1"></i>Pending</span>'

  const adminResponsePreview = complaint.adminResponse
    ? `<div class="mt-3 p-3 bg-success bg-opacity-10 rounded">
             <p class="text-success fw-bold mb-1"><i class="bi bi-shield-check me-1"></i>Admin Response:</p>
             <p class="text-success mb-0 small">${truncateText(complaint.adminResponse, 100)}</p>
         </div>`
    : ""

  return `
        <div class="card complaint-card mb-3">
            <div class="card-header">
                <div class="row align-items-center">
                    <div class="col">
                        <h5 class="card-title mb-1">${escapeHtml(complaint.title)}</h5>
                        <div class="d-flex flex-wrap gap-2 align-items-center text-muted small">
                            <span class="badge bg-secondary">${complaint.category}</span>
                            <span><i class="bi bi-calendar me-1"></i>${formatDate(complaint.createdAt)}</span>
                            <span><i class="bi bi-person me-1"></i>${complaint.isAnonymous ? "Anonymous" : escapeHtml(complaint.userName || "Unknown")}</span>
                        </div>
                    </div>
                    <div class="col-auto">
                        ${statusBadge}
                    </div>
                </div>
            </div>
            <div class="card-body">
                <p class="card-text">${escapeHtml(truncateText(complaint.description, 200))}</p>
                ${adminResponsePreview}
                <div class="mt-3">
                    <button class="btn btn-outline-primary btn-sm" onclick="viewComplaintDetail(${complaint.id})">
                        <i class="bi bi-eye me-1"></i>View Details
                    </button>
                </div>
            </div>
        </div>
    `
}

function toggleMyComplaints() {
  const myComplaintsBtn = document.getElementById("myComplaintsBtn")
  if (!myComplaintsBtn) return

  showMyComplaints = !showMyComplaints

  if (showMyComplaints) {
    myComplaintsBtn.classList.remove("btn-outline-primary")
    myComplaintsBtn.classList.add("btn-primary")
    myComplaintsBtn.innerHTML = '<i class="bi bi-person-check me-1"></i>My Complaints'
  } else {
    myComplaintsBtn.classList.remove("btn-primary")
    myComplaintsBtn.classList.add("btn-outline-primary")
    myComplaintsBtn.innerHTML = '<i class="bi bi-person me-1"></i>My Complaints'
  }

  filterComplaints()
}

function viewComplaintDetail(complaintId) {
  currentComplaintId = complaintId
  showPage("complaintDetail")
  loadComplaintDetail()
}

// Complaint Detail Functions
async function loadComplaintDetail() {
  const loadingSpinner = document.getElementById("detailLoadingSpinner")
  const complaintDetails = document.getElementById("complaintDetails")
  const errorMessage = document.getElementById("errorMessage")

  try {
    if (loadingSpinner) loadingSpinner.classList.remove("d-none")
    if (complaintDetails) complaintDetails.classList.add("d-none")
    if (errorMessage) errorMessage.classList.add("d-none")

    if (!currentComplaintId) {
      throw new Error("No complaint ID provided")
    }

    await delay(1000)

    const complaints = getComplaints()
    const complaint = complaints.find((c) => c.id == currentComplaintId)

    if (!complaint) {
      throw new Error("Complaint not found")
    }

    if (loadingSpinner) loadingSpinner.classList.add("d-none")
    if (complaintDetails) complaintDetails.classList.remove("d-none")

    populateComplaintDetails(complaint)
  } catch (error) {
    console.error("Error loading complaint:", error)
    if (loadingSpinner) loadingSpinner.classList.add("d-none")
    if (errorMessage) errorMessage.classList.remove("d-none")
  }
}

function populateComplaintDetails(complaint) {
  if (!complaint) return

  // Basic information
  const elements = {
    complaintTitle: complaint.title,
    complaintCategory: complaint.category,
    complaintAuthor: complaint.isAnonymous ? "Anonymous User" : complaint.userName || "Unknown",
    complaintDate: formatDate(complaint.createdAt),
    complaintUpdated: formatDate(complaint.updatedAt),
    complaintDescription: complaint.description,
  }

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id)
    if (element) element.textContent = value
  })

  // Status badge
  const statusBadge = document.getElementById("statusBadge")
  if (statusBadge) {
    if (complaint.status === "resolved") {
      statusBadge.className = "badge bg-success"
      statusBadge.innerHTML = '<i class="bi bi-check-circle me-1"></i>Resolved'
    } else {
      statusBadge.className = "badge bg-warning text-dark"
      statusBadge.innerHTML = '<i class="bi bi-clock me-1"></i>Pending Review'
    }
  }

  // Image
  const imageSection = document.getElementById("imageSection")
  const complaintImage = document.getElementById("complaintImage")
  if (complaint.imageUrl && imageSection && complaintImage) {
    imageSection.classList.remove("d-none")
    complaintImage.src = complaint.imageUrl
  }

  // Admin response
  const adminResponseCard = document.getElementById("adminResponseCard")
  const adminResponseText = document.getElementById("adminResponseText")
  const adminResponseDate = document.getElementById("adminResponseDate")

  if (complaint.adminResponse && adminResponseCard && adminResponseText && adminResponseDate) {
    adminResponseCard.classList.remove("d-none")
    adminResponseText.textContent = complaint.adminResponse
    adminResponseDate.textContent = formatDate(complaint.updatedAt)
  }
}

// Login Functions
function initializeLoginPage() {
  const togglePasswordBtn = document.getElementById("toggleLoginPassword")
  const passwordInput = document.getElementById("loginPassword")

  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener("click", function () {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
      passwordInput.setAttribute("type", type)

      const icon = this.querySelector("i")
      icon.classList.toggle("bi-eye")
      icon.classList.toggle("bi-eye-slash")
    })
  }

  if (isLoggedIn()) {
    showPage("home")
  }
}

async function handleLogin(e) {
  e.preventDefault()

  const loginBtn = document.getElementById("loginBtn")
  const originalBtnText = loginBtn.innerHTML

  clearAlerts()

  const email = document.getElementById("loginEmail").value.trim()
  const password = document.getElementById("loginPassword").value

  if (!email || !password) {
    showAlert("Please fill in all fields.", "danger")
    return
  }

  loginBtn.disabled = true
  loginBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
        Signing in...
    `

  try {
    const result = await login(email, password)

    if (result.success) {
      showAlert("Login successful! Redirecting...", "success")

      setTimeout(() => {
        showPage("home")
      }, 1500)
    } else {
      showAlert(result.message || "Invalid email or password.", "danger")
    }
  } catch (error) {
    console.error("Login error:", error)
    showAlert("Login failed. Please try again.", "danger")
  } finally {
    loginBtn.disabled = false
    loginBtn.innerHTML = originalBtnText
  }
}

// Register Functions
function initializeRegisterPage() {
  const togglePasswordBtn = document.getElementById("toggleRegisterPassword")
  const toggleConfirmPasswordBtn = document.getElementById("toggleConfirmPassword")
  const passwordInput = document.getElementById("registerPassword")
  const confirmPasswordInput = document.getElementById("confirmPassword")

  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener("click", function () {
      togglePasswordVisibility(passwordInput, this)
    })
  }

  if (toggleConfirmPasswordBtn && confirmPasswordInput) {
    toggleConfirmPasswordBtn.addEventListener("click", function () {
      togglePasswordVisibility(confirmPasswordInput, this)
    })
  }

  if (confirmPasswordInput && passwordInput) {
    confirmPasswordInput.addEventListener("input", validatePasswordMatch)
    passwordInput.addEventListener("input", validatePasswordMatch)
  }

  if (isLoggedIn()) {
    showPage("home")
  }
}

function togglePasswordVisibility(input, button) {
  const type = input.getAttribute("type") === "password" ? "text" : "password"
  input.setAttribute("type", type)

  const icon = button.querySelector("i")
  icon.classList.toggle("bi-eye")
  icon.classList.toggle("bi-eye-slash")
}

function validatePasswordMatch() {
  const password = document.getElementById("registerPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value
  const confirmPasswordInput = document.getElementById("confirmPassword")

  if (confirmPassword && password !== confirmPassword) {
    confirmPasswordInput.setCustomValidity("Passwords do not match")
    confirmPasswordInput.classList.add("is-invalid")
  } else {
    confirmPasswordInput.setCustomValidity("")
    confirmPasswordInput.classList.remove("is-invalid")
  }
}

async function handleRegistration(e) {
  e.preventDefault()

  const registerBtn = document.getElementById("registerBtn")
  const originalBtnText = registerBtn.innerHTML

  clearAlerts()

  const fullName = document.getElementById("fullName").value.trim()
  const email = document.getElementById("registerEmail").value.trim()
  const password = document.getElementById("registerPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value
  const agreeTerms = document.getElementById("agreeTerms").checked

  if (!fullName || !email || !password || !confirmPassword) {
    showAlert("Please fill in all fields.", "danger")
    return
  }

  if (password !== confirmPassword) {
    showAlert("Passwords do not match.", "danger")
    return
  }

  if (password.length < 6) {
    showAlert("Password must be at least 6 characters long.", "danger")
    return
  }

  if (!agreeTerms) {
    showAlert("Please agree to the Terms and Conditions.", "danger")
    return
  }

  registerBtn.disabled = true
  registerBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
        Creating account...
    `

  try {
    const result = await register(fullName, email, password)

    if (result.success) {
      showAlert("Registration successful! Welcome to ComplaintHub!", "success")

      setTimeout(() => {
        showPage("home")
      }, 2000)
    } else {
      showAlert(result.message || "Registration failed. Please try again.", "danger")
    }
  } catch (error) {
    console.error("Registration error:", error)
    showAlert("Registration failed. Please try again.", "danger")
  } finally {
    registerBtn.disabled = false
    registerBtn.innerHTML = originalBtnText
  }
}

// Admin Dashboard Functions
function initializeAdminDashboard() {
  if (!isLoggedIn() || !isAdmin()) {
    const accessDenied = document.getElementById("accessDenied")
    if (accessDenied) accessDenied.classList.remove("d-none")
    return
  }

  const adminContent = document.getElementById("adminContent")
  if (adminContent) adminContent.classList.remove("d-none")

  setupAdminEventListeners()
  loadAdminComplaints()
}

function setupAdminEventListeners() {
  const adminCategoryFilter = document.getElementById("adminCategoryFilter")
  const adminStatusFilter = document.getElementById("adminStatusFilter")
  const adminSearchInput = document.getElementById("adminSearchInput")

  if (adminCategoryFilter) {
    adminCategoryFilter.addEventListener("change", filterAdminComplaints)
  }

  if (adminStatusFilter) {
    adminStatusFilter.addEventListener("change", filterAdminComplaints)
  }

  if (adminSearchInput) {
    adminSearchInput.addEventListener("input", debounce(filterAdminComplaints, 300))
  }
}

async function loadAdminComplaints() {
  const loadingSpinner = document.getElementById("adminLoadingSpinner")
  const complaintsContainer = document.getElementById("adminComplaintsContainer")

  try {
    if (loadingSpinner) loadingSpinner.classList.remove("d-none")
    if (complaintsContainer) complaintsContainer.innerHTML = ""

    await delay(1000)

    allComplaints = getComplaints()

    if (loadingSpinner) loadingSpinner.classList.add("d-none")

    updateAdminStats()
    filterAdminComplaints()
  } catch (error) {
    console.error("Error loading complaints:", error)
    if (loadingSpinner) loadingSpinner.classList.add("d-none")
    showAlert("Failed to load complaints. Please try again.", "danger")
  }
}

function updateAdminStats() {
  const total = allComplaints.length
  const pending = allComplaints.filter((c) => c.status === "pending").length
  const resolved = allComplaints.filter((c) => c.status === "resolved").length
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0

  animateCounter("totalComplaintsAdmin", total)
  animateCounter("pendingComplaintsAdmin", pending)
  animateCounter("resolvedComplaintsAdmin", resolved)
  animateCounter("resolutionRateAdmin", resolutionRate, "%")
}

function filterAdminComplaints() {
  const adminSearchInput = document.getElementById("adminSearchInput")
  const adminCategoryFilter = document.getElementById("adminCategoryFilter")
  const adminStatusFilter = document.getElementById("adminStatusFilter")

  const searchTerm = adminSearchInput ? adminSearchInput.value.toLowerCase() : ""
  const categoryFilter = adminCategoryFilter ? adminCategoryFilter.value : ""
  const statusFilter = adminStatusFilter ? adminStatusFilter.value : ""

  filteredComplaints = [...allComplaints]

  if (searchTerm) {
    filteredComplaints = filteredComplaints.filter(
      (complaint) =>
        complaint.title.toLowerCase().includes(searchTerm) ||
        complaint.description.toLowerCase().includes(searchTerm) ||
        (complaint.userName && complaint.userName.toLowerCase().includes(searchTerm)),
    )
  }

  if (categoryFilter) {
    filteredComplaints = filteredComplaints.filter((complaint) => complaint.category === categoryFilter)
  }

  if (statusFilter) {
    filteredComplaints = filteredComplaints.filter((complaint) => complaint.status === statusFilter)
  }

  filteredComplaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const complaintsCount = document.getElementById("complaintsCount")
  if (complaintsCount) {
    complaintsCount.textContent = filteredComplaints.length
  }

  displayAdminComplaints()
}

function displayAdminComplaints() {
  const complaintsContainer = document.getElementById("adminComplaintsContainer")
  const noResults = document.getElementById("adminNoResults")

  if (!complaintsContainer || !noResults) return

  if (filteredComplaints.length === 0) {
    complaintsContainer.innerHTML = ""
    noResults.classList.remove("d-none")
    return
  }

  noResults.classList.add("d-none")

  const complaintsHTML = filteredComplaints.map((complaint) => createAdminComplaintCard(complaint)).join("")
  complaintsContainer.innerHTML = complaintsHTML
}

function createAdminComplaintCard(complaint) {
  const statusBadge =
    complaint.status === "resolved"
      ? '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Resolved</span>'
      : '<span class="badge bg-warning text-dark"><i class="bi bi-clock me-1"></i>Pending</span>'

  const adminResponsePreview = complaint.adminResponse
    ? `<div class="mt-3 p-3 bg-info bg-opacity-10 rounded">
             <p class="text-info fw-bold mb-1"><i class="bi bi-chat-square-text me-1"></i>Admin Response:</p>
             <p class="text-info mb-0 small">${truncateText(complaint.adminResponse, 100)}</p>
         </div>`
    : ""

  return `
        <div class="card complaint-card mb-3">
            <div class="card-header">
                <div class="row align-items-center">
                    <div class="col">
                        <h5 class="card-title mb-1">${escapeHtml(complaint.title)}</h5>
                        <div class="d-flex flex-wrap gap-2 align-items-center text-muted small">
                            <span class="badge bg-secondary">${complaint.category}</span>
                            <span><i class="bi bi-calendar me-1"></i>${formatDate(complaint.createdAt)}</span>
                            <span><i class="bi bi-person me-1"></i>${complaint.isAnonymous ? "Anonymous" : escapeHtml(complaint.userName || "Unknown")}</span>
                        </div>
                    </div>
                    <div class="col-auto">
                        ${statusBadge}
                    </div>
                </div>
            </div>
            <div class="card-body">
                <p class="card-text">${escapeHtml(truncateText(complaint.description, 200))}</p>
                ${adminResponsePreview}
                <div class="mt-3">
                    <button class="btn btn-primary btn-sm" onclick="openComplaintModal(${complaint.id})">
                        <i class="bi bi-gear me-1"></i>Manage
                    </button>
                    <button class="btn btn-outline-secondary btn-sm ms-2" onclick="viewComplaintDetail(${complaint.id})">
                        <i class="bi bi-eye me-1"></i>View Details
                    </button>
                </div>
            </div>
        </div>
    `
}

function openComplaintModal(complaintId) {
  const complaint = allComplaints.find((c) => c.id === complaintId)
  if (!complaint) return

  currentComplaintForEdit = complaint

  // Populate modal fields
  const elements = {
    modalTitle: complaint.title,
    modalCategory: complaint.category,
    modalStatus: complaint.status,
    modalAuthor: complaint.isAnonymous ? "Anonymous" : complaint.userName || "Unknown",
    modalDate: formatDate(complaint.createdAt),
    modalDescription: complaint.description,
  }

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id)
    if (element) element.textContent = value
  })

  // Show current response if exists
  const currentResponseSection = document.getElementById("currentResponseSection")
  const currentResponse = document.getElementById("currentResponse")
  const adminResponse = document.getElementById("adminResponse")

  if (complaint.adminResponse) {
    if (currentResponseSection) currentResponseSection.classList.remove("d-none")
    if (currentResponse) currentResponse.textContent = complaint.adminResponse
    if (adminResponse) adminResponse.value = complaint.adminResponse
  } else {
    if (currentResponseSection) currentResponseSection.classList.add("d-none")
    if (adminResponse) adminResponse.value = ""
  }

  // Set status dropdown
  const newStatus = document.getElementById("newStatus")
  if (newStatus) newStatus.value = complaint.status

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("complaintModal"))
  modal.show()
}

async function handleComplaintUpdate() {
  if (!currentComplaintForEdit) return

  const updateBtn = document.getElementById("updateComplaintBtn")
  const originalBtnText = updateBtn.innerHTML

  const adminResponse = document.getElementById("adminResponse").value.trim()
  const newStatus = document.getElementById("newStatus").value

  if (newStatus === "resolved" && !adminResponse) {
    showAlert("Admin response is required when marking as resolved.", "danger")
    return
  }

  updateBtn.disabled = true
  updateBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
        Updating...
    `

  try {
    await delay(1000)

    const complaintIndex = allComplaints.findIndex((c) => c.id === currentComplaintForEdit.id)
    if (complaintIndex !== -1) {
      allComplaints[complaintIndex] = {
        ...allComplaints[complaintIndex],
        status: newStatus,
        adminResponse: adminResponse || allComplaints[complaintIndex].adminResponse,
        updatedAt: new Date().toISOString(),
      }

      localStorage.setItem("complaints", JSON.stringify(allComplaints))

      updateAdminStats()
      filterAdminComplaints()

      const modal = bootstrap.Modal.getInstance(document.getElementById("complaintModal"))
      modal.hide()

      showAlert("Complaint updated successfully!", "success")
    }
  } catch (error) {
    console.error("Update error:", error)
    showAlert("Failed to update complaint. Please try again.", "danger")
  } finally {
    updateBtn.disabled = false
    updateBtn.innerHTML = originalBtnText
  }
}

// Data Management Functions
function getComplaints() {
  const complaints = localStorage.getItem("complaints")
  return complaints ? JSON.parse(complaints) : []
}

function initializeSampleData() {
  const existingComplaints = localStorage.getItem("complaints")
  if (!existingComplaints) {
    const sampleComplaints = [
      {
        id: 1,
        title: "Broken elevator in Building A",
        category: "Maintenance",
        description:
          "The elevator has been out of order for 3 days now. This is causing inconvenience for elderly residents and people with disabilities.",
        status: "pending",
        isAnonymous: false,
        userId: 2,
        userName: "John Doe",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        title: "Poor food quality in cafeteria",
        category: "Cafeteria",
        description:
          "The food served today was cold and tasteless. The vegetables were overcooked and the meat was dry.",
        status: "resolved",
        isAnonymous: true,
        adminResponse:
          "We have addressed this issue with the cafeteria staff and improved our quality control measures. Thank you for bringing this to our attention.",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 3,
        title: "Security concerns in parking lot",
        category: "Security",
        description:
          "Inadequate lighting in the parking area makes it unsafe during evening hours. Several residents have reported feeling unsafe.",
        status: "pending",
        isAnonymous: false,
        userId: 3,
        userName: "Jane Smith",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 4,
        title: "WiFi connectivity issues",
        category: "IT Support",
        description:
          "Internet connection keeps dropping in the common areas. This affects people working from the lobby.",
        status: "resolved",
        isAnonymous: false,
        userId: 2,
        userName: "John Doe",
        adminResponse:
          "We have upgraded our WiFi infrastructure and the issue should now be resolved. Please let us know if you continue to experience problems.",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 5,
        title: "Cleanliness issues in restrooms",
        category: "Cleanliness",
        description:
          "The restrooms on the 3rd floor are not being cleaned regularly. There is often no soap or paper towels.",
        status: "pending",
        isAnonymous: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    localStorage.setItem("complaints", JSON.stringify(sampleComplaints))
  }
}

// Utility Functions
function showAlert(message, type = "info") {
  const alertContainer = document.getElementById("alertContainer")
  if (!alertContainer) return

  const alertId = "alert-" + Date.now()
  const alertHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert" id="${alertId}">
            <i class="bi bi-${getAlertIcon(type)} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `

  alertContainer.insertAdjacentHTML("beforeend", alertHTML)

  setTimeout(() => {
    const alertElement = document.getElementById(alertId)
    if (alertElement) {
      alertElement.remove()
    }
  }, 5000)
}

function getAlertIcon(type) {
  const icons = {
    success: "check-circle",
    danger: "exclamation-triangle",
    warning: "exclamation-triangle",
    info: "info-circle",
    primary: "info-circle",
  }
  return icons[type] || "info-circle"
}

function clearAlerts() {
  const alertContainer = document.getElementById("alertContainer")
  if (alertContainer) {
    alertContainer.innerHTML = ""
  }
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
