# Tabler UI Documentation Cache

**Source**: Context7 Library ID `/tabler/tabler`  
**Trust Score**: 9.8/10  
**Code Snippets**: 875  
**Last Updated**: September 5, 2025

## Overview

Tabler is a free and open-source HTML dashboard template built with Bootstrap 5. It provides a clean, modern interface with extensive components, icons, and layouts designed for admin dashboards and web applications.

## Key Topics

- Dashboard layouts and components
- Navigation and sidebar management
- Cards and data presentation
- Forms and input components
- Icons and visual elements

## Installation and Setup

```html
<!-- CDN -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta17/dist/css/tabler.min.css">
<script src="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta17/dist/js/tabler.min.js"></script>

<!-- Icons -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons@latest/icons-sprite.svg">
```

```bash

# NPM Installation

npm install @tabler/core
npm install @tabler/icons
```

## Code Examples

### Basic Page Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
  <meta http-equiv="X-UA-Compatible" content="ie=edge"/>
  <title>Dashboard - Tabler</title>
  <link href="./dist/css/tabler.min.css?1668287865" rel="stylesheet"/>
</head>
<body>
  <div class="page">
    <!-- Navbar -->
    <header class="navbar navbar-expand-md navbar-light d-print-none">
      <div class="container-xl">
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-menu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <h1 class="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3">
          <a href=".">
            <img src="./static/logo.svg" width="110" height="32" alt="Tabler" class="navbar-brand-image">
          </a>
        </h1>
      </div>
    </header>
    
    <!-- Page wrapper -->
    <div class="page-wrapper">
      <!-- Page header -->
      <div class="page-header d-print-none">
        <div class="container-xl">
          <div class="row g-2 align-items-center">
            <div class="col">
              <h2 class="page-title">Dashboard</h2>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Page body -->
      <div class="page-body">
        <div class="container-xl">
          <!-- Content here -->
        </div>
      </div>
    </div>
  </div>
  <script src="./dist/js/tabler.min.js?1668287865"></script>
</body>
</html>
```

### Navigation Sidebar

```html
<aside class="navbar navbar-vertical navbar-expand-lg navbar-dark">
  <div class="container-fluid">
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#sidebar-menu">
      <span class="navbar-toggler-icon"></span>
    </button>
    <h1 class="navbar-brand navbar-brand-autodark">
      <a href=".">
        <img src="./static/logo-white.svg" width="110" height="32" alt="Tabler" class="navbar-brand-image">
      </a>
    </h1>
    
    <div class="collapse navbar-collapse" id="sidebar-menu">
      <ul class="navbar-nav pt-lg-3">
        <li class="nav-item">
          <a class="nav-link" href="./index.html">
            <span class="nav-link-icon d-md-none d-lg-inline-block">
              <svg class="icon"><use xlink:href="#tabler-home"></use></svg>
            </span>
            <span class="nav-link-title">Home</span>
          </a>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#navbar-base" data-bs-toggle="dropdown" role="button" aria-expanded="false">
            <span class="nav-link-icon d-md-none d-lg-inline-block">
              <svg class="icon"><use xlink:href="#tabler-package"></use></svg>
            </span>
            <span class="nav-link-title">Interface</span>
          </a>
          <div class="dropdown-menu">
            <div class="dropdown-menu-columns">
              <div class="dropdown-menu-column">
                <a class="dropdown-item" href="./alerts.html">Alerts</a>
                <a class="dropdown-item" href="./accordion.html">Accordion</a>
                <a class="dropdown-item" href="./blank.html">Blank page</a>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</aside>
```

### Dashboard Cards

```html
<!-- Stats Cards -->
<div class="row row-deck row-cards">
  <div class="col-sm-6 col-lg-3">
    <div class="card">
      <div class="card-body">
        <div class="d-flex align-items-center">
          <div class="subheader">Sales</div>
          <div class="ms-auto lh-1">
            <div class="dropdown">
              <a class="dropdown-toggle text-muted" href="#" data-bs-toggle="dropdown">Last 7 days</a>
              <div class="dropdown-menu dropdown-menu-end">
                <a class="dropdown-item active" href="#">Last 7 days</a>
                <a class="dropdown-item" href="#">Last 30 days</a>
                <a class="dropdown-item" href="#">Last 3 months</a>
              </div>
            </div>
          </div>
        </div>
        <div class="h1 mb-3">75%</div>
        <div class="d-flex mb-2">
          <div class="flex-fill">
            <div class="progress progress-sm">
              <div class="progress-bar bg-primary" style="width: 75%" role="progressbar"></div>
            </div>
          </div>
          <div class="ms-3">
            <span class="text-green d-inline-flex align-items-center lh-1">
              7%
              <svg class="icon ms-1"><use xlink:href="#tabler-trending-up"></use></svg>
            </span>
          </div>
        </div>
        <div class="text-muted">16 out of 20 targets reached</div>
      </div>
    </div>
  </div>
  
  <div class="col-sm-6 col-lg-3">
    <div class="card">
      <div class="card-body">
        <div class="d-flex align-items-center">
          <div class="subheader">Revenue</div>
        </div>
        <div class="d-flex align-items-baseline">
          <div class="h1 mb-0 me-2">$4,300</div>
          <div class="me-auto">
            <span class="text-green d-inline-flex align-items-center lh-1">
              8%
              <svg class="icon ms-1"><use xlink:href="#tabler-trending-up"></use></svg>
            </span>
          </div>
        </div>
      </div>
      <div id="chart-revenue-bg" class="chart-sm"></div>
    </div>
  </div>
</div>
```

### Data Tables

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Invoices</h3>
  </div>
  <div class="card-body border-bottom py-3">
    <div class="d-flex">
      <div class="text-muted">
        Show
        <div class="mx-2 d-inline-block">
          <input type="text" class="form-control form-control-sm" value="8" size="3">
        </div>
        entries
      </div>
      <div class="ms-auto text-muted">
        Search:
        <div class="ms-2 d-inline-block">
          <input type="text" class="form-control form-control-sm">
        </div>
      </div>
    </div>
  </div>
  <div class="table-responsive">
    <table class="table card-table table-vcenter text-nowrap datatable">
      <thead>
        <tr>
          <th class="w-1"><input class="form-check-input m-0 align-middle" type="checkbox"></th>
          <th class="w-1">No.</th>
          <th>Invoice subject</th>
          <th>Client</th>
          <th>VAT No.</th>
          <th>Created</th>
          <th>Status</th>
          <th>Price</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><input class="form-check-input m-0 align-middle" type="checkbox"></td>
          <td><span class="text-muted">001401</span></td>
          <td><a href="invoice.html" class="text-reset" tabindex="-1">Design Works</a></td>
          <td>
            <span class="flag flag-xs flag-country-us"></span>
            Carlson Limited
          </td>
          <td>87956621</td>
          <td>15 Dec 2017</td>
          <td><span class="badge bg-success me-1"></span> Paid</td>
          <td>$887</td>
          <td class="text-end">
            <span class="dropdown">
              <button class="btn dropdown-toggle align-text-top" data-bs-toggle="dropdown">Actions</button>
              <div class="dropdown-menu dropdown-menu-end">
                <a class="dropdown-item" href="#">Action</a>
                <a class="dropdown-item" href="#">Another action</a>
              </div>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### Forms

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Account Settings</h3>
  </div>
  <div class="card-body">
    <div class="mb-3">
      <label class="form-label">Email address</label>
      <input type="email" class="form-control" placeholder="your@email.com">
    </div>
    <div class="mb-3">
      <label class="form-label">Password</label>
      <div class="input-group input-group-flat">
        <input type="password" class="form-control" placeholder="Your password">
        <span class="input-group-text">
          <a href="#" class="link-secondary" title="Show password" data-bs-toggle="tooltip">
            <svg class="icon"><use xlink:href="#tabler-eye"></use></svg>
          </a>
        </span>
      </div>
    </div>
    <div class="mb-3">
      <label class="form-label">Language</label>
      <select class="form-select">
        <option value="1">English</option>
        <option value="2">Spanish</option>
        <option value="3">French</option>
      </select>
    </div>
    <div class="form-footer">
      <button type="submit" class="btn btn-primary">Save</button>
    </div>
  </div>
</div>
```

### Modal Dialogs

```html
<!-- Modal -->
<div class="modal modal-blur fade" id="modal-report" tabindex="-1" role="dialog" aria-hidden="true">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">New report</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
          <label class="form-label">Name</label>
          <input type="text" class="form-control" name="name" placeholder="Your report name">
        </div>
        <div class="mb-3">
          <label class="form-label">Report type</label>
          <select class="form-select">
            <option value="1">Simple</option>
            <option value="2">Advanced</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <a href="#" class="btn btn-link link-secondary" data-bs-dismiss="modal">Cancel</a>
        <a href="#" class="btn btn-primary ms-auto" data-bs-dismiss="modal">
          <svg class="icon"><use xlink:href="#tabler-plus"></use></svg>
          Create new report
        </a>
      </div>
    </div>
  </div>
</div>

<!-- Button to trigger modal -->
<a href="#" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal-report">
  New report
</a>
```

### Alert Messages

```html
<!-- Success Alert -->
<div class="alert alert-success" role="alert">
  <div class="d-flex">
    <div>
      <svg class="icon alert-icon"><use xlink:href="#tabler-check"></use></svg>
    </div>
    <div>
      <h4 class="alert-title">Wow! Everything worked!</h4>
      <div class="text-muted">Your account has been saved successfully.</div>
    </div>
  </div>
</div>

<!-- Danger Alert -->
<div class="alert alert-danger" role="alert">
  <div class="d-flex">
    <div>
      <svg class="icon alert-icon"><use xlink:href="#tabler-alert-circle"></use></svg>
    </div>
    <div>
      <h4 class="alert-title">Oh snap! Change a few things up and try submitting again.</h4>
      <div class="text-muted">Your account has not been saved successfully.</div>
    </div>
  </div>
</div>

<!-- Dismissible Alert -->
<div class="alert alert-important alert-warning alert-dismissible" role="alert">
  <div class="d-flex">
    <div>
      <svg class="icon alert-icon"><use xlink:href="#tabler-alert-triangle"></use></svg>
    </div>
    <div>
      Warning! Better check yourself, you're not looking too good.
    </div>
  </div>
  <a class="btn-close" data-bs-dismiss="alert" aria-label="close"></a>
</div>
```

### Badges and Labels

```html
<!-- Badges -->
<span class="badge bg-primary">Primary</span>
<span class="badge bg-secondary">Secondary</span>
<span class="badge bg-success">Success</span>
<span class="badge bg-danger">Danger</span>
<span class="badge bg-warning">Warning</span>
<span class="badge bg-info">Info</span>

<!-- Badge with icon -->
<span class="badge bg-success">
  <svg class="icon icon-xs"><use xlink:href="#tabler-check"></use></svg>
  Success
</span>

<!-- Status dots -->
<span class="status status-green">
  <span class="status-dot"></span>
  Online
</span>
<span class="status status-red">
  <span class="status-dot"></span>
  Offline
</span>
```

### Progress Bars

```html
<!-- Basic progress -->
<div class="progress">
  <div class="progress-bar" style="width: 25%" role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
    <span class="visually-hidden">25% Complete</span>
  </div>
</div>

<!-- Progress with label -->
<div class="progress">
  <div class="progress-bar" style="width: 75%" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">75%</div>
</div>

<!-- Small progress -->
<div class="progress progress-sm">
  <div class="progress-bar bg-success" style="width: 57%" role="progressbar"></div>
</div>

<!-- Multiple bars -->
<div class="progress">
  <div class="progress-bar bg-primary" style="width: 15%" role="progressbar"></div>
  <div class="progress-bar bg-success" style="width: 30%" role="progressbar"></div>
  <div class="progress-bar bg-info" style="width: 20%" role="progressbar"></div>
</div>
```

## Tabler Icons

```html
<!-- Basic icon usage -->
<svg class="icon">
  <use xlink:href="#tabler-home"></use>
</svg>

<!-- Icon with size classes -->
<svg class="icon icon-xs">
  <use xlink:href="#tabler-user"></use>
</svg>
<svg class="icon icon-sm">
  <use xlink:href="#tabler-settings"></use>
</svg>
<svg class="icon icon-lg">
  <use xlink:href="#tabler-heart"></use>
</svg>

<!-- Colored icons -->
<svg class="icon text-red">
  <use xlink:href="#tabler-heart"></use>
</svg>
<svg class="icon text-green">
  <use xlink:href="#tabler-check"></use>
</svg>
```

## Layout Classes

### Grid System

```html
<!-- Basic grid -->
<div class="row">
  <div class="col-md-6">Column 1</div>
  <div class="col-md-6">Column 2</div>
</div>

<!-- Card deck -->
<div class="row row-deck row-cards">
  <div class="col-12">
    <div class="card">
      <div class="card-body">Full width card</div>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card">
      <div class="card-body">Half width card</div>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card">
      <div class="card-body">Half width card</div>
    </div>
  </div>
</div>
```

### Spacing Utilities

```html
<!-- Margin and padding -->
<div class="mt-3 mb-3 pt-2 pb-2">Content with spacing</div>

<!-- Text utilities -->
<p class="text-muted">Muted text</p>
<p class="text-red">Red text</p>
<p class="text-green">Green text</p>
<p class="text-blue">Blue text</p>

<!-- Display utilities -->
<div class="d-none d-md-block">Hidden on mobile</div>
<div class="d-md-none">Visible only on mobile</div>
```

## JavaScript Components

### Tabs

```javascript
// Initialize tabs
var tabEl = document.querySelector('button[data-bs-toggle="tab"]');
var tab = new bootstrap.Tab(tabEl);

// Show tab
tab.show();

// Tab events
document.addEventListener('shown.bs.tab', function (event) {
  console.log(event.target); // newly activated tab
  console.log(event.relatedTarget); // previous active tab
});
```

### Dropdowns

```javascript
// Initialize dropdown
var dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
var dropdownList = dropdownElementList.map(function (dropdownToggleEl) {
  return new bootstrap.Dropdown(dropdownToggleEl);
});

// Dropdown events
document.addEventListener('show.bs.dropdown', function (event) {
  console.log('Dropdown is about to be shown');
});
```

### Tooltips

```javascript
// Initialize tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl);
});
```

## Best Practices

1. **Use semantic HTML** structure with proper ARIA labels
2. **Implement responsive design** with Tabler's grid system
3. **Maintain consistent spacing** using utility classes
4. **Use appropriate color schemes** for different contexts
5. **Optimize icon usage** with sprite sheets
6. **Test accessibility** with screen readers
7. **Follow Bootstrap conventions** for component usage

## Customization

### CSS Variables

```css
:root {
  --tblr-primary: #206bc4;
  --tblr-secondary: #626976;
  --tblr-success: #2fb344;
  --tblr-danger: #d63384;
  --tblr-warning: #f76707;
  --tblr-info: #4299e1;
}
```

### Custom Themes

```scss
// Custom theme variables
$primary: #your-color;
$secondary: #your-secondary-color;

// Import Tabler
@import "tabler";
```

## HexTrackr Integration

In HexTrackr, Tabler UI is used for:

- Dashboard layout and structure
- Navigation and sidebar components
- Data table presentations
- Form styling and validation
- Modal dialogs and alerts
- Icon system throughout the interface
