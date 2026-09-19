import ErrorPage from "../components/ErrorPage";

const NotFound = () => (
  <ErrorPage
    code="404"
    face="confused"
    title="This track doesn't exist"
    message="The page you're looking for was moved, deleted, or never existed. Check the address, or head back home."
  />
);

export default NotFound;