import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Breadcrumb from '../../../../components/Breadcrumb';
import { Enrollment, Evaluation, FinalScoreRecord, Grade, Group, Student } from '../../../../models/Academic';
import { managementService } from '../../../../services/managementService';
import { evaluationService } from '../../../../services/evaluationService';

type FinalScorePreviewRow = {
  enrollmentId: string;
  studentName: string;
  consolidatedScore: number;
  evaluatedCount: number;
  expectedCount: number;
  status: 'COMPLETA' | 'PARCIAL';
};

const FinalScores = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [officialScores, setOfficialScores] = useState<FinalScoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  const studentNameById = useMemo(
    () =>
      new Map(
        students.map((student) => [
          student.id || '',
          `${student.first_name} ${student.last_name}`.trim() || student.identification,
        ])
      ),
    [students]
  );

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId),
    [groups, selectedGroupId]
  );

  const groupEvaluations = useMemo(
    () =>
      evaluations.filter(
        (evaluation) => evaluation.group_id === selectedGroupId && Boolean(evaluation.rubric_id)
      ),
    [evaluations, selectedGroupId]
  );

  const rubricToEvaluation = useMemo(() => {
    const mapping = new Map<string, Evaluation>();
    groupEvaluations.forEach((evaluation) => {
      if (evaluation.rubric_id) {
        mapping.set(evaluation.rubric_id, evaluation);
      }
    });
    return mapping;
  }, [groupEvaluations]);

  const activeEnrollments = useMemo(
    () =>
      enrollments.filter(
        (enrollment) => enrollment.group_id === selectedGroupId && enrollment.status !== 'CANCELLED'
      ),
    [enrollments, selectedGroupId]
  );

  const previewRows = useMemo<FinalScorePreviewRow[]>(() => {
    if (!selectedGroupId) {
      return [];
    }

    return activeEnrollments.map((enrollment) => {
      const enrollmentGrades = grades.filter((grade) => {
        const mappedEvaluation = rubricToEvaluation.get(grade.rubric_id);
        return grade.enrollment_id === enrollment.id && Boolean(mappedEvaluation);
      });

      const consolidated = enrollmentGrades.reduce((accumulator, grade) => {
        const evaluation = rubricToEvaluation.get(grade.rubric_id);
        const weighted = evaluation ? grade.final_score * (evaluation.weight / 100) : 0;
        return accumulator + weighted;
      }, 0);

      const sentOrLockedCount = enrollmentGrades.filter(
        (grade) => grade.status === 'SENT' || Boolean(grade.is_locked)
      ).length;

      const expectedCount = rubricToEvaluation.size;

      return {
        enrollmentId: enrollment.id || '',
        studentName: studentNameById.get(enrollment.student_id) || enrollment.student_id,
        consolidatedScore: Number(consolidated.toFixed(2)),
        evaluatedCount: sentOrLockedCount,
        expectedCount,
        status: sentOrLockedCount === expectedCount ? 'COMPLETA' : 'PARCIAL',
      };
    });
  }, [activeEnrollments, grades, rubricToEvaluation, selectedGroupId, studentNameById]);

  const hasIncompleteRows = useMemo(
    () => previewRows.some((row) => row.status === 'PARCIAL'),
    [previewRows]
  );

  const displayedRows = useMemo(() => {
    if (officialScores.length === 0) {
      return previewRows;
    }

    const officialByEnrollment = new Map(
      officialScores.map((record) => [record.enrollment_id, record])
    );

    return previewRows.map((row) => {
      const official = officialByEnrollment.get(row.enrollmentId);
      if (!official) {
        return row;
      }

      return {
        ...row,
        consolidatedScore: Number(official.official_final_score.toFixed(2)),
        evaluatedCount: official.evaluations_count,
      };
    });
  }, [officialScores, previewRows]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [groupData, evaluationData, enrollmentData, gradeData, studentData] = await Promise.all([
        managementService.getGroups(),
        evaluationService.getEvaluations(),
        managementService.getEnrollments(),
        evaluationService.getGrades(),
        managementService.getStudents(),
      ]);

      setGroups(groupData.filter((group) => group.id));
      setEvaluations(evaluationData.filter((evaluation) => evaluation.id));
      setEnrollments(enrollmentData);
      setGrades(gradeData);
      setStudents(studentData.filter((student) => student.id));
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'No se pudo cargar la información de nota final',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    setOfficialScores([]);
  }, [selectedGroupId]);

  const handleRegisterFinalScores = async () => {
    if (!selectedGroupId) {
      await Swal.fire({
        icon: 'warning',
        title: 'Falta seleccionar grupo',
        text: 'Selecciona un grupo para registrar la nota final.',
      });
      return;
    }

    if (displayedRows.length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Sin estudiantes',
        text: 'No hay estudiantes activos para registrar en este grupo.',
      });
      return;
    }

    const confirmation = await Swal.fire({
      icon: hasIncompleteRows ? 'warning' : 'question',
      title: 'Confirmar registro oficial',
      text: hasIncompleteRows
        ? 'Hay estudiantes con notas parciales. Se registrará igualmente según lo disponible. ¿Deseas continuar?'
        : 'Se registrarán oficialmente las notas finales del grupo y las calificaciones quedarán bloqueadas.',
      showCancelButton: true,
      confirmButtonText: 'Sí, registrar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setIsRegistering(true);
    try {
      const result = await evaluationService.registerFinalScores(selectedGroupId);
      setOfficialScores(result);

      const refreshedGrades = await evaluationService.getGrades();
      setGrades(refreshedGrades);

      await Swal.fire({
        icon: 'success',
        title: 'Notas finales registradas',
        text: 'El consolidado quedó registrado de forma oficial para este grupo.',
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'No se pudo registrar la nota final',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!selectedGroup) {
      void Swal.fire({
        icon: 'warning',
        title: 'Selecciona un grupo',
        text: 'Debes seleccionar un grupo para generar el reporte en PDF.',
      });
      return;
    }

    if (displayedRows.length === 0) {
      void Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'No hay datos para generar el reporte.',
      });
      return;
    }

    const doc = new jsPDF();
    const generatedAt = new Date().toLocaleString();

    doc.setFontSize(14);
    doc.text('Reporte de Nota Final - HU-12', 14, 15);
    doc.setFontSize(10);
    doc.text(`Grupo: ${selectedGroup.name} (${selectedGroup.group_code})`, 14, 23);
    doc.text(`Fecha de generación: ${generatedAt}`, 14, 29);

    autoTable(doc, {
      startY: 35,
      head: [['Estudiante', 'Nota final', 'Evaluaciones', 'Estado']],
      body: displayedRows.map((row) => [
        row.studentName,
        row.consolidatedScore.toFixed(2),
        `${row.evaluatedCount}/${row.expectedCount}`,
        row.status,
      ]),
      styles: {
        fontSize: 9,
      },
      headStyles: {
        fillColor: [24, 119, 242],
      },
    });

    doc.save(`reporte-nota-final-${selectedGroup.group_code}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-black dark:text-white">
        Cargando notas finales...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb pageName="Registrar nota final" />

      <section className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-black dark:text-white">Consolidado de notas finales</h1>
          <p className="text-sm text-body">
            HU-12: revisa la suma ponderada por estudiante, confirma y registra oficialmente el grupo.
          </p>
        </div>

        <label className="flex max-w-xl flex-col gap-2">
          <span className="text-sm font-medium text-black dark:text-white">Grupo</span>
          <select
            value={selectedGroupId}
            onChange={(event: { target: { value: string } }) => setSelectedGroupId(event.target.value)}
            className="rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
          >
            <option value="">Selecciona un grupo</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name} · {group.group_code}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        {!selectedGroupId ? (
          <p className="text-sm text-body">Selecciona un grupo para ver el consolidado de notas finales.</p>
        ) : displayedRows.length === 0 ? (
          <p className="text-sm text-body">No hay estudiantes o evaluaciones calificadas para este grupo.</p>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr className="border-b border-stroke text-left text-sm text-black dark:border-strokedark dark:text-white">
                    <th className="py-3 pr-4">Estudiante</th>
                    <th className="py-3 pr-4">Nota final</th>
                    <th className="py-3 pr-4">Cobertura evaluaciones</th>
                    <th className="py-3 pr-4">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRows.map((row) => (
                    <tr key={row.enrollmentId} className="border-b border-stroke text-sm dark:border-strokedark">
                      <td className="py-3 pr-4 text-black dark:text-white">{row.studentName}</td>
                      <td className="py-3 pr-4 font-semibold text-primary">{row.consolidatedScore.toFixed(2)}</td>
                      <td className="py-3 pr-4 text-body">
                        {row.evaluatedCount}/{row.expectedCount}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`rounded px-2 py-1 text-xs font-semibold ${
                            row.status === 'COMPLETA'
                              ? 'bg-success/20 text-success'
                              : 'bg-warning/20 text-warning'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasIncompleteRows && (
              <div className="rounded-md border border-warning bg-warning/10 p-4 text-sm text-warning">
                Existen estudiantes con consolidado parcial. Puedes registrar de todos modos según regla de excepción.
              </div>
            )}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-black dark:text-white">Acciones oficiales</h2>
          <p className="text-sm text-body">
            Confirma el registro para bloquear edición y luego descarga el reporte PDF del grupo.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={!selectedGroupId || displayedRows.length === 0}
            className="rounded-md border border-stroke px-4 py-2 text-sm font-medium text-black hover:bg-gray-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
          >
            Descargar PDF
          </button>
          <button
            type="button"
            onClick={() => void handleRegisterFinalScores()}
            disabled={!selectedGroupId || displayedRows.length === 0 || isRegistering}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Registrar nota final
          </button>
        </div>
      </section>
    </div>
  );
};

export default FinalScores;
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Breadcrumb from '../../../../components/Breadcrumb';
import { Enrollment, Evaluation, FinalScoreRecord, Grade, Group, Student } from '../../../../models/Academic';
import { managementService } from '../../../../services/managementService';
import { evaluationService } from '../../../../services/evaluationService';

type FinalScorePreviewRow = {
  enrollmentId: string;
  studentName: string;
  consolidatedScore: number;
  evaluatedCount: number;
  expectedCount: number;
  status: 'COMPLETA' | 'PARCIAL';
};

const FinalScores = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [officialScores, setOfficialScores] = useState<FinalScoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  const studentNameById = useMemo(
    () =>
      new Map(
        students.map((student) => [
          student.id || '',
          `${student.first_name} ${student.last_name}`.trim() || student.identification,
        ])
      ),
    [students]
  );

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId),
    [groups, selectedGroupId]
  );

  const groupEvaluations = useMemo(
    () =>
      evaluations.filter(
        (evaluation) => evaluation.group_id === selectedGroupId && Boolean(evaluation.rubric_id)
      ),
    [evaluations, selectedGroupId]
  );

  const rubricToEvaluation = useMemo(() => {
    const mapping = new Map<string, Evaluation>();
    groupEvaluations.forEach((evaluation) => {
      if (evaluation.rubric_id) {
        mapping.set(evaluation.rubric_id, evaluation);
      }
    });
    return mapping;
  }, [groupEvaluations]);

  const activeEnrollments = useMemo(
    () =>
      enrollments.filter(
        (enrollment) =>
          enrollment.group_id === selectedGroupId && enrollment.status !== 'CANCELLED'
      ),
    [enrollments, selectedGroupId]
  );

  const previewRows = useMemo<FinalScorePreviewRow[]>(() => {
    if (!selectedGroupId) {
      return [];
    }

    return activeEnrollments
      .map((enrollment) => {
        const enrollmentGrades = grades.filter((grade) => {
          const mappedEvaluation = rubricToEvaluation.get(grade.rubric_id);
          return grade.enrollment_id === enrollment.id && Boolean(mappedEvaluation);
        });

        const consolidated = enrollmentGrades.reduce((accumulator, grade) => {
          const evaluation = rubricToEvaluation.get(grade.rubric_id);
          const weighted = evaluation ? grade.final_score * (evaluation.weight / 100) : 0;
          return accumulator + weighted;
        }, 0);

        const sentOrLockedCount = enrollmentGrades.filter(
          (grade) => grade.status === 'SENT' || Boolean(grade.is_locked)
        ).length;

        const expectedCount = rubricToEvaluation.size;

        return {
          enrollmentId: enrollment.id || '',
          studentName: studentNameById.get(enrollment.student_id) || enrollment.student_id,
          consolidatedScore: Number(consolidated.toFixed(2)),
          evaluatedCount: sentOrLockedCount,
          expectedCount,
          status: sentOrLockedCount === expectedCount ? 'COMPLETA' : 'PARCIAL',
        };
      })
      .sort((first, second) => first.studentName.localeCompare(second.studentName));
  }, [activeEnrollments, grades, rubricToEvaluation, selectedGroupId, studentNameById]);

  const hasIncompleteRows = useMemo(
    () => previewRows.some((row) => row.status === 'PARCIAL'),
    [previewRows]
  );

  const displayedRows = useMemo(() => {
    if (officialScores.length === 0) {
      return previewRows;
    }

    const officialByEnrollment = new Map(
      officialScores.map((record) => [record.enrollment_id, record])
    );

    return previewRows.map((row) => {
      const official = officialByEnrollment.get(row.enrollmentId);
      if (!official) {
        return row;
      }

      return {
        ...row,
        consolidatedScore: Number(official.official_final_score.toFixed(2)),
        evaluatedCount: official.evaluations_count,
      };
    });
  }, [officialScores, previewRows]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [groupData, evaluationData, enrollmentData, gradeData, studentData] = await Promise.all([
        managementService.getGroups(),
        evaluationService.getEvaluations(),
        managementService.getEnrollments(),
        evaluationService.getGrades(),
        managementService.getStudents(),
      ]);

      setGroups(groupData.filter((group) => group.id));
      setEvaluations(evaluationData.filter((evaluation) => evaluation.id));
      setEnrollments(enrollmentData);
      setGrades(gradeData);
      setStudents(studentData.filter((student) => student.id));
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'No se pudo cargar la informacion de nota final',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    setOfficialScores([]);
  }, [selectedGroupId]);

  const handleRegisterFinalScores = async () => {
    if (!selectedGroupId) {
      await Swal.fire({
        icon: 'warning',
        title: 'Falta seleccionar grupo',
        text: 'Selecciona un grupo para registrar la nota final.',
      });
      return;
    }

    if (displayedRows.length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Sin estudiantes',
        text: 'No hay estudiantes activos para registrar en este grupo.',
      });
      return;
    }

    const confirmation = await Swal.fire({
      icon: hasIncompleteRows ? 'warning' : 'question',
      title: 'Confirmar registro oficial',
      text: hasIncompleteRows
        ? 'Hay estudiantes con notas parciales. Se registrara igualmente segun lo disponible. Deseas continuar?'
        : 'Se registraran oficialmente las notas finales del grupo y las calificaciones quedaran bloqueadas.',
      showCancelButton: true,
      confirmButtonText: 'Si, registrar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setIsRegistering(true);
    try {
      const result = await evaluationService.registerFinalScores(selectedGroupId);
      setOfficialScores(result);

      const refreshedGrades = await evaluationService.getGrades();
      setGrades(refreshedGrades);

      await Swal.fire({
        icon: 'success',
        title: 'Notas finales registradas',
        text: 'El consolidado quedo registrado de forma oficial para este grupo.',
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'No se pudo registrar la nota final',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!selectedGroup) {
      void Swal.fire({
        icon: 'warning',
        title: 'Selecciona un grupo',
        text: 'Debes seleccionar un grupo para generar el reporte en PDF.',
      });
      return;
    }

    if (displayedRows.length === 0) {
      void Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'No hay datos para generar el reporte.',
      });
      return;
    }

    const doc = new jsPDF();
    const generatedAt = new Date().toLocaleString();

    doc.setFontSize(14);
    doc.text('Reporte de Nota Final - HU-12', 14, 15);
    doc.setFontSize(10);
    doc.text(`Grupo: ${selectedGroup.name} (${selectedGroup.group_code})`, 14, 23);
    doc.text(`Fecha de generacion: ${generatedAt}`, 14, 29);

    autoTable(doc, {
      startY: 35,
      head: [['Estudiante', 'Nota final', 'Evaluaciones', 'Estado']],
      body: displayedRows.map((row) => [
        row.studentName,
        row.consolidatedScore.toFixed(2),
        `${row.evaluatedCount}/${row.expectedCount}`,
        row.status,
      ]),
      styles: {
        fontSize: 9,
      },
      headStyles: {
        fillColor: [24, 119, 242],
      },
    });

    doc.save(`reporte-nota-final-${selectedGroup.group_code}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-black dark:text-white">
        Cargando notas finales...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb pageName="Registrar nota final" />

      <section className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-black dark:text-white">Consolidado de notas finales</h1>
          <p className="text-sm text-body">
            HU-12: revisa la suma ponderada por estudiante, confirma y registra oficialmente el grupo.
          </p>
        </div>

        <label className="flex max-w-xl flex-col gap-2">
          <span className="text-sm font-medium text-black dark:text-white">Grupo</span>
          <select
            value={selectedGroupId}
            onChange={(event: { target: { value: string } }) => setSelectedGroupId(event.target.value)}
            className="rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
          >
            <option value="">Selecciona un grupo</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name} · {group.group_code}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        {!selectedGroupId ? (
          <p className="text-sm text-body">Selecciona un grupo para ver el consolidado de notas finales.</p>
        ) : displayedRows.length === 0 ? (
          <p className="text-sm text-body">No hay estudiantes o evaluaciones calificadas para este grupo.</p>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr className="border-b border-stroke text-left text-sm text-black dark:border-strokedark dark:text-white">
                    <th className="py-3 pr-4">Estudiante</th>
                    <th className="py-3 pr-4">Nota final</th>
                    <th className="py-3 pr-4">Cobertura evaluaciones</th>
                    <th className="py-3 pr-4">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRows.map((row) => (
                    <tr key={row.enrollmentId} className="border-b border-stroke text-sm dark:border-strokedark">
                      <td className="py-3 pr-4 text-black dark:text-white">{row.studentName}</td>
                      <td className="py-3 pr-4 font-semibold text-primary">
                        {row.consolidatedScore.toFixed(2)}
                      </td>
                      <td className="py-3 pr-4 text-body">
                        {row.evaluatedCount}/{row.expectedCount}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`rounded px-2 py-1 text-xs font-semibold ${
                            row.status === 'COMPLETA'
                              ? 'bg-success/20 text-success'
                              : 'bg-warning/20 text-warning'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasIncompleteRows && (
              <div className="rounded-md border border-warning bg-warning/10 p-4 text-sm text-warning">
                Existen estudiantes con consolidado parcial. Puedes registrar de todos modos segun regla de excepcion.
              </div>
            )}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-black dark:text-white">Acciones oficiales</h2>
          <p className="text-sm text-body">
            Confirma el registro para bloquear edicion y luego descarga el reporte PDF del grupo.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={!selectedGroupId || displayedRows.length === 0}
            className="rounded-md border border-stroke px-4 py-2 text-sm font-medium text-black hover:bg-gray-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
          >
            Descargar PDF
          </button>
          <button
            type="button"
            onClick={() => void handleRegisterFinalScores()}
            disabled={!selectedGroupId || displayedRows.length === 0 || isRegistering}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Registrar nota final
          </button>
        </div>
      </section>
    </div>
  );
};

export default FinalScores;
