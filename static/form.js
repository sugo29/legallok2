 // Main Application Script
 document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('main-content');
    
    // Load form selection page by default
    loadFormSelection();
    
    // Sidebar navigation
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            if (this.querySelector('span').textContent === 'Forms') {
                loadFormSelection();
            }
        });
    });
    
    
    // Logout functionality
    document.querySelector('.logout-btn').addEventListener('click', function() {
        if(confirm('Are you sure you want to logout?')) {
            alert('You have been logged out successfully');
            // window.location.href = '/logout';
        }
    });
    
    // Back button event delegation
    document.body.addEventListener('click', function(e) {
        if (e.target.closest('#back-button')) {
            loadFormSelection();
        }
    });
});

// Load form selection page
async function loadFormSelection() {
    const template = document.getElementById('form-selection-template');
    const clone = template.content.cloneNode(true);
    document.getElementById('main-content').innerHTML = '';
    document.getElementById('main-content').appendChild(clone);
    
    // Load forms from JSON
    try {
        const response = await fetch('/api/forms');
        const forms = await response.json();
        renderFormCards(forms);
        
        // Setup filter functionality
        setupFilters();
    } catch (error) {
        console.error('Error loading forms:', error);
        document.getElementById('form-grid').innerHTML = 
            '<p>Error loading forms. Please try again later.</p>';
    }
}

// Render form cards in selection view
function renderFormCards(forms) {
    const formGrid = document.getElementById('form-grid');
    formGrid.innerHTML = '';
    
    forms.forEach(form => {
        const formCard = document.createElement('div');
        formCard.className = 'form-card';
        formCard.dataset.formId = form.id;
        formCard.dataset.category = form.category || 'general';
        formCard.innerHTML = `
            <h3>${form.title}</h3>
            <p>${form.description}</p>
            <div class="form-meta" style="margin-top: 10px;">
                <span style="font-size: 12px; color: #5D4037;">
                    <i class="fas fa-download"></i> ${form.downloads || 0} downloads
                </span>
            </div>
        `;
        
        formCard.addEventListener('click', () => loadFormFiller(form.id));
        formGrid.appendChild(formCard);
    });
}

// Setup filter functionality
function setupFilters() {
    const filterButton = document.getElementById('filter-button');
    const filterOptions = document.getElementById('filter-options');
    const searchInput = document.getElementById('form-search');
    
    // Toggle filter dropdown
    filterButton.addEventListener('click', () => {
        filterOptions.classList.toggle('show');
    });
    
    // Filter option selection
    document.querySelectorAll('.filter-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.filter-option').forEach(opt => 
                opt.classList.remove('active'));
            this.classList.add('active');
            filterButton.querySelector('span').textContent = this.textContent;
            filterOptions.classList.remove('show');
            
            const category = this.dataset.category;
            filterForms(category);
        });
    });
    
    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const activeCategory = document.querySelector('.filter-option.active').dataset.category;
        filterForms(activeCategory, searchTerm);
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!filterButton.contains(e.target) && !filterOptions.contains(e.target)) {
            filterOptions.classList.remove('show');
        }
    });
}
const allFilter = document.getElementById('filter-all');
  const categoryFilters = document.querySelectorAll('.category-filter:not(.all-filter)');
  
  allFilter.addEventListener('change', function() {
    const isChecked = this.checked;
    categoryFilters.forEach(filter => {
      filter.checked = isChecked;
    });
    updateFilterCount();
    performSearchAndFilter();
  });
  
  // Individual filter functionality
  categoryFilters.forEach(filter => {
    filter.addEventListener('change', function() {
      // If any individual filter is unchecked, uncheck "All"
      if (!this.checked && allFilter.checked) {
        allFilter.checked = false;
      }
      // If all individual filters are checked, check "All"
      else if (Array.from(categoryFilters).every(f => f.checked) {
        allFilter.checked = true;
      }
      updateFilterCount();
      performSearchAndFilter();
    });
  });
  
  // Update the filter count display
  function updateFilterCount() {
    const checkedCount = document.querySelectorAll('.category-filter:not(.all-filter):checked').length;
    const totalCount = categoryFilters.length;
    const filterCount = document.querySelector('.filter-count');
    
    if (checkedCount === totalCount) {
      filterCount.textContent = '(All)';
    } else {
      filterCount.textContent = `(${checkedCount}/${totalCount})`;
    }
  }
  
  // Initialize
  updateFilterCount();
  

// Filter forms by category and search term
function filterForms(category, searchTerm = '') {
    const formCards = document.querySelectorAll('.form-card');
    
    formCards.forEach(card => {
        const matchesCategory = category === 'all' || card.dataset.category === category;
        const matchesSearch = card.textContent.toLowerCase().includes(searchTerm);
        
        if (matchesCategory && matchesSearch) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}


// Load form filler for a specific form
async function loadFormFiller(formId) {
    try {
        const response = await fetch(`/api/forms/${formId}`);
        const formTemplate = await response.json();
        renderFormFiller(formTemplate);
    } catch (error) {
        console.error('Error loading form:', error);
        alert('Error loading form. Please try again later.');
    }
}

// Render the form filler
function renderFormFiller(formTemplate) {
    const template = document.getElementById('form-filler-template');
    const clone = template.content.cloneNode(true);
    document.getElementById('main-content').innerHTML = '';
    document.getElementById('main-content').appendChild(clone);
    
    // Set form title and description
    document.getElementById('form-title').innerHTML = 
        `<i class="fas fa-file-alt"></i> ${formTemplate.title}`;
    document.getElementById('form-description').textContent = formTemplate.description;
    
    // Render form fields
    const formElement = document.getElementById('dynamic-form');
    formTemplate.sections.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'form-section';
        sectionDiv.innerHTML = `<h3>${section.title}</h3>`;
        
        section.fields.forEach(field => {
            const fieldGroup = document.createElement('div');
            fieldGroup.className = 'form-group';
            
            const label = document.createElement('label');
            label.textContent = field.label;
            if (field.required) label.innerHTML += ' <span style="color:red">*</span>';
            
            let inputElement;
            switch(field.type) {
                case 'text':
                case 'number':
                case 'date':
                    inputElement = document.createElement('input');
                    inputElement.type = field.type;
                    inputElement.id = field.field_id;
                    inputElement.name = field.field_id;
                    if (field.placeholder) inputElement.placeholder = field.placeholder;
                    break;
                case 'textarea':
                    inputElement = document.createElement('textarea');
                    inputElement.id = field.field_id;
                    inputElement.name = field.field_id;
                    if (field.rows) inputElement.rows = field.rows;
                    break;
                case 'select':
                    inputElement = document.createElement('select');
                    inputElement.id = field.field_id;
                    inputElement.name = field.field_id;
                    field.options.forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.value = option.value;
                        optionElement.textContent = option.label;
                        inputElement.appendChild(optionElement);
                    });
                    break;
                case 'radio':
                case 'checkbox':
                    // Implement radio/checkbox groups as needed
                    break;
                default:
                    inputElement = document.createElement('input');
                    inputElement.type = 'text';
            }
            
            if (field.required) inputElement.required = true;
            
            fieldGroup.appendChild(label);
            fieldGroup.appendChild(inputElement);
            sectionDiv.appendChild(fieldGroup);
        });
        
        formElement.insertBefore(sectionDiv, formElement.querySelector('.form-actions'));
    });
    
    // Form submission
    document.getElementById('dynamic-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        
        // Submit to server
        fetch('/api/save-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                form_id: formTemplate.id,
                data: data
            })
        })
        .then(response => response.json())
        .then(data => {
            alert('Form submitted successfully!');
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            alert('Error submitting form. Please try again.');
        });
    });
    
    // Save draft functionality
    document.getElementById('save-draft-btn').addEventListener('click', function() {
        const formData = new FormData(document.getElementById('dynamic-form'));
        const data = Object.fromEntries(formData.entries());
        
        localStorage.setItem(`draft_${formTemplate.id}`, JSON.stringify(data));
        alert('Draft saved successfully!');
    });
    
    // Load draft if exists
    const draft = localStorage.getItem(`draft_${formTemplate.id}`);
    if (draft) {
        const data = JSON.parse(draft);
        Object.entries(data).forEach(([key, value]) => {
            const input = document.getElementById(key);
            if (input) input.value = value;
        });
    }
}