import ErrorPage from "../components/ErrorPage";

const WrongEndpoint = () => (
  <ErrorPage
    code="405"
    face="dizzy"
    title="Wrong endpoint"
    message="The address we tried to reach doesn't exist or doesn't accept this kind of request. Please go back and try again."
  />
);

export default WrongEndpoint;