import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import BasicTableOne from '../../components/tables/BasicTables/BasicTableOne';

export default function BasicTables() {
  return (
    <>
      <PageMeta
        title="Basic Tables - EximEx | Data Management Interface"
        description="Access and manage your import-export data with EximEx table interface for efficient business operations and data organization."
      />
      <PageBreadcrumb pageTitle="Basic Tables" />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </>
  );
}
