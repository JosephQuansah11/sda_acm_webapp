import React, { useState } from "react";
import {
  Form,
  Button,
} from "react-bootstrap";

interface LoginFormProps {
  onSubmit: (identifier: string, password?: string) => void;
  identifierType: "email" | "phone";
  onIdentifierTypeChange: (type: "email" | "phone") => void;
  isSubmitting: boolean;
  isValidIdentifier: () => boolean;
  identifier: string;
  password?: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  identifierType,
  onIdentifierTypeChange,
  isSubmitting,
  isValidIdentifier,
  identifier,
  password,
  handleInputChange,
  isLoading,
}) => {
  const isFormValid = identifier && password && isValidIdentifier();

  return (
    <Form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(identifier, password);
    }}>
      {/* Identifier Type Selector */}
      <Form.Group className="mb-3">
        <Form.Label>Login with:</Form.Label>
        <div className="d-flex gap-3">
          <Form.Check
            type="radio"
            id="email-radio"
            name="identifierType"
            label="Email"
            checked={identifierType === "email"}
            onChange={() => onIdentifierTypeChange("email")}
          />
          <Form.Check
            type="radio"
            id="phone-radio"
            name="identifierType"
            label="Phone"
            checked={identifierType === "phone"}
            onChange={() => onIdentifierTypeChange("phone")}
          />
        </div>
      </Form.Group>

      {/* Identifier Input */}
      <Form.Group className="mb-3">
        <Form.Label>
          {identifierType === "email"
            ? "Email Address"
            : "Phone Number"}
        </Form.Label>
        <Form.Control
          type={identifierType === "email" ? "email" : "tel"}
          name="identifier"  
          value={identifier}
          onChange={handleInputChange}
          placeholder={
            identifierType === "email"
              ? "Enter your email address"
              : "Enter your phone number"
          }
          isInvalid={identifier ? !isValidIdentifier() : false}
          required
        />
        <Form.Control.Feedback type="invalid">
          Please enter a valid{" "}
          {identifierType === "email"
            ? "email address"
            : "phone number"}
          .
        </Form.Control.Feedback>
      </Form.Group>

      {/* Password Input */}
      <Form.Group className="mb-4">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          name="password"
          value={password}
          onChange={handleInputChange}
          placeholder="Enter your password"
          required
        />
      </Form.Group>

      {/* Submit Button */}
      <Button
        variant="primary"
        type="submit"
        className="w-100 py-2"
        disabled={!isFormValid || isSubmitting || isLoading}
      >
        {isSubmitting || isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </Form>
  );
};

export default LoginForm;