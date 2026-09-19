import ErrorPage from "../components/ErrorPage";

const BadRequest = () => (
  <ErrorPage
    code="400"
    face="surprised"
    title="Bad request"
    message="We couldn't understand that request. Something in it was missing or invalid. Please try again."
    secondary={{ label: "Try again", onClick: () => window.location.reload() }}
  />
);

export default BadRequest;