const { User, Book } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select("-__v -password")

        return userData;
      }

      throw new AuthenticationError("This user is not logged in.");
    },
  },
  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Your username or password is incorrect");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Your username or password is incorrect");
      }

      const token = signToken(user);
      return { token, user };
    },
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (parent, args, context) => {
      if (context.user) {
    
        const userUpdate = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: args.bookData } },
          { new: true }
        );
    
        return userUpdate;
      }
    
      throw new AuthenticationError('You can only save books if logged in!');
    },
    removeBook: async (parent, args, context) => {
      if (context.user) {
    
        const userUpdate = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: args.bookId } } },
          { new: true }
        );
    
        return userUpdate;
      }
    
      throw new AuthenticationError('You can only remove books if logged in!');
    },
  }
};

module.exports = resolvers;