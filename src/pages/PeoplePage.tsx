import { useEffect, useMemo, useState } from 'react';
import { Loader } from '../components/Loader';
import { Person } from '../types';
import { getPeople } from '../api';
import classNames from 'classnames';
import { Link, useParams } from 'react-router-dom';

export const PeoplePage = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { slug } = useParams<{ slug?: string }>();

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    getPeople()
      .then(data => setPeople(data))
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const peopleByName = useMemo(() => {
    const map = new Map<string, Person>();

    people.forEach(p => map.set(p.name, p));

    return map;
  }, [people]);

  const renderRelativeCell = (relativeName?: string | null) => {
    if (!relativeName) {
      return '-';
    }

    const relatedPerson = peopleByName.get(relativeName);

    if (!relatedPerson) {
      return relativeName;
    }

    return (
      <a
        href={`#/people/${relatedPerson.slug}`}
        className={classNames({
          'has-text-danger': relatedPerson.sex === 'f',
        })}
      >
        {relatedPerson.name}
      </a>
    );
  };

  return (
    <>
      <h1 className="title">People Page</h1>
      {hasError && (
        <p data-cy="peopleLoadingError" className="has-text-danger">
          Something went wrong
        </p>
      )}
      {!isLoading && !hasError && people.length === 0 && (
        <p data-cy="noPeopleMessage">There are no people on the server</p>
      )}
      {!isLoading && !hasError && people.length > 0 && (
        <table
          data-cy="peopleTable"
          className="table is-striped is-hoverable is-narrow is-fullwidth"
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Sex</th>
              <th>Born</th>
              <th>Died</th>
              <th>Mother</th>
              <th>Father</th>
            </tr>
          </thead>

          <tbody>
            {people.map(person => (
              <>
                <tr
                  key={person.slug}
                  data-cy="person"
                  className={classNames({
                    'has-background-warning': person.slug === slug,
                  })}
                >
                  <td>
                    <Link
                      to={`/people/${person.slug}`}
                      className={classNames({
                        'has-text-danger': person.sex === 'f',
                        'has-text-link': person.sex === 'm',
                      })}
                    >
                      {person.name}
                    </Link>
                  </td>

                  <td>{person.sex}</td>
                  <td>{person.born}</td>
                  <td>{person.died || '-'}</td>
                  <td>{renderRelativeCell(person.motherName)}</td>
                  <td>{renderRelativeCell(person.fatherName)}</td>
                </tr>
              </>
            ))}
          </tbody>
        </table>
      )}
      {isLoading && (
        <div className="block">
          <div className="box table-container">
            <Loader />
          </div>
        </div>
      )}
    </>
  );
};
