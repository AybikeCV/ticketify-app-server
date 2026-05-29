# ticketify-app-server

## [See the App!](www.ticketify-theta.vercel.app)

![App Logo](TICKETIFY)

## Description

Ticketify is a concert booking and management website built with the
MERN stack. Users can explore concerts, view details, and book tickets
through a smooth and modern interface.

#### [Client Repo](www.github.com/AybikeCV/ticketify-app-client)

#### [Server Repo](www.github.com/AybikeCV/ticketify-app-server)

## Backlog Functionalities

- Real ticketing system
- Upgraded/improved seat selection
- Mail confirmation/cancel notifications to admin

## Technologies used

- React
- Express
- Axios
- Node.js
- MongoDB
- Cloudinary

# Server Structure

## Models

Booking Model

```javascript

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
        },
        concert: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Concert",
            required: [true, "Concert is required"],
        },
        seats: {
            type: [String],
            required: [true, "At least one seat must be selected"],
        },
        totalPrice: {
            type: Number,
            required: [true, "Total price is required"],
            min: [0, "Total price cannot be negative"],
        },
        status: {
            type: String,
            enum: {
                values: ["confirmed", "cancelled"],
                message: "Invalid booking status",
            },
            default: "confirmed",
        },
        cancelledAt: { type: Date, default: null },
        cancelReason: { type: String, trim: true, maxlength: [300, "Cancel reason cannot exceed 300 characters"], default: "" },
```

Concert Model

```javascript
 title: {
                type: String,
                required: [true, "Title is required."],
                trim: true,
                minlength: [2, "Title must be at least 2 characters."],
                maxlength: [150, "Title cannot exceed 150 characters."],
            },
            artist: {
                type: String,
                required: [true, "Artist name is required."],
                trim: true,
                maxlength: [100, "Artist name cannot exceed 100 characters."],
            },
            description: {
                type: String,
                required: [true, "Description is required."],
                trim: true,
                minlength: [10, "Description must be at least 10 characters."],
                maxlength: [2000, "Description cannot exceed 2000 characters."],
            },
            venue: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Venue",
                required: [true, "Venue is required."],
            },
            date: {
                type: Date,
                required: [true, "Event date is required."],
                validate: {
                    validator: function (value) {

                        return this.isNew ? value > new Date() : true;
                        // Only enforce future date on new documents
                        /*if (this.isNew) {
  return value > new Date();
} else {
  return true;
}*/
                    },
                    message: "Event date must be in the future.",
                },
            },
            doorsOpen: {
                type: String, // "00:00"
                trim: true,
                default: "",
            },
            genre: {
                type: String,
                required: [true, "Genre is required."],
                enum: {
                    values: [
                        "ambient",
                        "pop",
                        "rock",
                        "hiphop",
                        "electronic",
                        "jazz",
                        "classical",
                        "rnb",
                        "folk",
                        "metal",
                        "indie",
                        "alternative",
                        "psychedelic",
                        "other",
                    ],
                    message: "Invalid genre value.",
                },
            },
            price: {
                type: Number,
                required: [true, "Price is required."],
                min: [0, "Price cannot be negative."],
            },
            totalSeats: {
                type: Number,
                required: [true, "Total seats is required."],
                min: [1, "There must be at least 1 seat."],
            },
            availableSeats: {
                type: Number,
                min: [0, "Available seats cannot be negative."],
            },
            image: {
                type: String,
                default: "",
            },
            imagePublicId: {
                type: String, // Cloudinary public_id
                default: "",
            },
            status: {
                type: String,
                enum: {
                    values: ["upcoming", "cancelled", "sold_out", "past"],
                    message: "Invalid status value",
                },
                default: "upcoming",
            },
            featured: {
                type: Boolean,
                default: false,
            },
            createdBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },

```

User Model

```javascript
 name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      minlength: [2, "Name must be at least 2 charachters."],
      maxlength: [50, "Name cannot exceed 50 characters."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email."],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "Role must be either 'user' or 'admin'",
      },
      default: "user",
    },
    avatar: {
      type: String,
      default: "",
    },
    avatarPublicId: {
      type: String, // Cloudinary public_id — needed to delete old avatar
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },

```

Venue Model

```javascript
name: {
            type: String,
            required: [true, "Venue name is required."],
            trim: true,
            minlength: [2, "Name must be at least 2 characters."],
            maxlength: [100, "Name cannot exceed 100 characters."],
        },
        address: {
            type: String,
            required: [true, "Address is required."],
            trim: true,
            maxlength: [200, "Address cannot exceed 200 characters."],
        },
        city: {
            type: String,
            required: [true, "City is required."],
            trim: true,
            maxlength: [100, "City cannot exceed 100 characters."],
        },
        country: {
            type: String,
            required: [true, "Country is required."],
            trim: true,
            default: "Netherlands",
        },

        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: [true, "Coordinates are required"],
                validate: {
                    validator: function (val) {
                        // Must be exactly [longitude, latitude]
                        // longitude: -180 to 180, latitude: -90 to 90
                        return (
                            val.length === 2 &&
                            val[0] >= -180 && val[0] <= 180 &&
                            val[1] >= -90 && val[1] <= 90
                        );
                    },
                    message: "Coordinates must be [longitude, latitude] with valid ranges.",
                },
            },
        },

        capacity: {
            type: Number,
            required: [true, "Capacity is required."],
            min: [1, "Capacity must be at least 1"],
        },
        image: {
            type: String,
            default: "",
        },
        imagePublicId: {
            type: String, // Cloudinary public_id
            default: "",
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters."],
            default: "",
        },
```

## API Endpoints (backend routes)

| HTTP Method | URL                    | Request Body            | Success status | Error Status | Description                                                       |
| ----------- | ---------------------- | ----------------------- | -------------- | ------------ | ----------------------------------------------------------------- |
| POST        | `/auth/signup`         | {name, email, password} | 201            | 400          | Registers the user in the Database                                |
| POST        | `/auth/login`          | {email, password}       | 200            | 400          | Validates credentials, creates and sends Token                    |
| GET         | `/auth/verify`         |                         | 200            | 401          | Verifies the user Token                                           |
| GET         | `/users/profile`       |                         | 200            | 400          | Get users profile (Private-User)                                  |
| PATCH       | `/users/profile`       |                         | 201            | 400          | Edit user info (Private-User)                                     |
| DELETE      | `/users/profile`       |                         | 200            | 400, 401     | Delete user profile (Private-User)                                |
| GET         | `/users`               |                         | 200            | 400          | Get users (Private-Admin)                                         |
| GET         | `/users/:id`           |                         | 200            | 401          | Get a single user (Private-Admin)                                 |
| PATCH       | `/users/:id`           | {role, isActive}        | 200            | 400          | Admin can set the role of the user , or if the user active or not |
| DELETE      | `/users/:id`           |                         | 200            | 400, 401     | Admin deletes the user (Private-Admin)                            |
| GET         | `/venues`              |                         | 200            | 401          | Get all venues (Public-Private User-Admin)                        |
| GET         | `/venue/:id`           |                         | 200            | 400          | Get one venue (Public-Private User-Admin)                         |
| POST        | `/venues`              |                         | 200            | 400          | Create a venue (Private Admin)                                    |
| PUT         | `/venues/:id`          |                         | 200            | 400          | Edit a venue (Private Admin)                                      |
| DELETE      | `/venues/:id`          |                         | 200            | 400          | Delete a venue (Private Admin)                                    |
| POST        | `/bookings`            |                         | 200            | 400          | Create a booking (Private User)                                   |
| PATCH       | `/bookings/:id`        |                         | 200            | 400          | Cancels a booking (Private User-Admin)                            |
| GET         | `/bookings`            |                         | 200            | 400          | Get all bookings(Private Admin)                                   |
| GET         | `/bookings/:id`        |                         | 200            | 400          | Get one booking(Private Admin)                                    |
| GET         | `/bookings/mybookings` |                         | 200            | 400          | Get all booking made one user (Private User)                      |
| POST        | `/concerts`            |                         | 200            | 400          | Create a concert (Private Admin)                                  |
| PATCH       | `/concerts/:id`        |                         | 200            | 400          | Edit a concert (Private Admin)                                    |
| DELETE      | `/concerts/:id`        |                         | 200            | 400          | Delete a concert (Private Admin)                                  |
| GET         | `/concerts`            |                         | 200            | 400          | Get all concerts (Public)                                         |
| GET         | `/concerts/:id`        |                         | 200            | 400          | Get one concert(Public)                                           |

## Links

### Collaborators

[Aybike Celebi Visser](www.github.com/AybikeCV)

### Project

[Repository Link Client](www.github.com/AybikeCV/ticketify-app-client)

[Repository Link Server](www.github.com/AybikeCV/ticketify-app-server)

[Deploy Link](www.ticketify-theta.vercel.app)

### Excalidraw

[Sketches/Wireframes](www.excalidraw.com/#json=6jnnPUwAxs38soKWjJ5r3,sooLTbnZDD_Sbg3eiASRLA)

### Slides

[Slides Link](https://docs.google.com/presentation/d/1JtMY8X4sbqucA7S-gOPvai35mNzwO3nfjHxWdwkOpAU/edit?slide=id.gc6f73a04f_0_0#slide=id.gc6f73a04f_0_0)
