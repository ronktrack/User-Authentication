const { PrismaClient } = require("@prisma/client");
// const nodemailer = require("nodemailer");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const url = require("url");

const Prisma = new PrismaClient();

const register = async (req, res, next) => {
  try {
    // fill all fields
    const { firstName, lastName, email, password, role } = req.body;

    // check fields

    if (!(firstName && lastName && email && password)) {
      res.status(400).send({ Message: "fill All fields." });
    }

    const existantUser = await Prisma.user.findFirst({ where: { email } });

    if (existantUser) {
      res.status(409).send({ Messagge: "Email already exist" });
    }

    const hashPassword = await bcrypt.hash(password, 12);

    const parseUrl = url.parse(req.url, true);

    const pathName = parseUrl.pathname;

    let userRole;

    if (pathName === "/register/customer") {
      userRole = "customer";
    } else if (pathName === "/register/admin") {
      userRole = "admin";
    }

    const newUser = await Prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashPassword``,
        role: userRole,
      },
    });

    // create token logic

    const token = JWT.sign(
      { userId: newUser.id, email },
      process.env.secretString,
      { expiresIn: "1d" }
    );

    // "TURN OFF TWO-STEP AUTHENTICATION IN YOUR GOOGLE ACCOUNT AND LET THIRD PARTIES ACCESS IF YOU MUST USE THIS FUNCTION. THEN, FILL OUT THE FOLLOWING INFORMATION."

    // const sendMail = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: "userEmail",
    //     pass: "EmailPassword",
    //   },
    // });

    // let mailOptions = {
    //   from: "yourEmail",
    //   to: email,
    //   subject: "Verify Your Email.",
    //   text: `http://localhost:3000/verifyemail/${token}`,
    // };

    // sendMail.sendMail(mailOptions);

    // save token
    newUser.token = token;
    res.status(201).send(newUser);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send({ Message: "Fill all Fields." });
    }

    const user = await Prisma.user.findFirst({
      where: { email },
      select: { role: true, password: true, id: true, token: true },
    });
    const userRole = user.role;
    console.log(userRole);

    if (userRole === "admin") {
      if (user && (await bcrypt.compare(password, user.password))) {
        const token = JWT.sign(
          { userId: user.id, email },
          process.env.secretString,
          { expiresIn: "1d" }
        );
        console.log(token);
        await Prisma.user.update({
          where: { id: user.id },
          data: { token: token },
        });
        res.status(201).send(user);
      } else res.status(501).send({ Message: "Invalid credentials." });
    } else {
      res
        .status(404)
        .send({ Message: "You are not allowed to login from here" });
    }

    // res.status(400).send({ Message: "Wrong credentials" });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
