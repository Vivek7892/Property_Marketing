import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { propertyAPI } from '../api';
import PropertyCard from '../components/property/PropertyCard';
import PropertyFilters from '../components/property/PropertyFilters';
import SearchBar from '../components/property/SearchBar';

export default function PropertyListPage() {
  const [params] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    const queryParams = Object.fromEntries(params.entries());
    propertyAPI.list({ ...queryParams, page })
      .then(({ data }) => { setProperties(data.results); setCount(data.count); })
      .finally(() => setLoading(false));
  }, [params, page]);

  useEffect(() => { setPage(1); }, [params]);

  const totalPages = Math.ceil(count / 12);

  return (
    <div className="container my-4">
      <div className="mb-4"><SearchBar compact /></div>
      <div className="row g-4">
        <div className="col-lg-3">
          <PropertyFilters />
        </div>
        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 fw-semibold">{count} Properties Found</h5>
          </div>
          {loading ? (
            <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" /></div>
          ) : properties.length === 0 ? (
            <div className="text-center py-5">
              <h5 className="text-muted">No properties found</h5>
              <p className="text-muted">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                {properties.map((p) => (
                  <div key={p.id} className="col"><PropertyCard property={p} /></div>
                ))}
              </div>
              {totalPages > 1 && (
                <nav className="mt-4 d-flex justify-content-center">
                  <ul className="pagination">
                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPage(page - 1)}>Previous</button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li key={i + 1} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                      </li>
                    ))}
                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPage(page + 1)}>Next</button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
