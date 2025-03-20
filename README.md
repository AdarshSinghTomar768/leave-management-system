# Leave Management System

A modern leave management application built with React and Material-UI.

## Features

- 🎨 Modern UI with Material Design
- 🌓 Dark/Light theme support
- 📱 Fully responsive design
- 🔐 User authentication
- 👤 Profile management
- 📅 Leave request management
- 📧 Email notifications
- 🔄 Automatic leave status determination

## Leave Types and Limits

### Annual Leave

- ≤ 20 days: Automatically approved
- 21-34 days: Pending approval
- ≥ 35 days: Automatically rejected

### Sick Leave

- ≤ 12 days: Automatically approved
- 13-26 days: Pending approval
- ≥ 27 days: Automatically rejected

## Tech Stack

- React
- Redux for state management
- Material-UI for components
- EmailJS for email notifications
- React Router for navigation

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/AdarshSinghTomar768/leave-management-system.git
```

2. Install dependencies:

```bash
cd leave-management-system
npm install
```

3. Create a `.env` file in the frontend directory with your EmailJS credentials:

```env
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
```

4. Start the development server:

```bash
npm start
```

## Screenshots

![Dashboard](screenshots/dashboard.png)
![Leave Request](screenshots/leave-request.png)
![Profile](screenshots/profile.png)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
