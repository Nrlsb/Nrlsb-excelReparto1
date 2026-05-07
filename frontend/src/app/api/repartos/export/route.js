import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { getUser, getUserRole, unauthorizedResponse } from '@/lib/auth';
import ExcelJS from 'exceljs';
import path from 'path';

export async function GET(req) {
  const user = await getUser(req);
  if (!user) return unauthorizedResponse();

  const role = await getUserRole(user.id);
  let query = supabaseAdmin.from('repartos').select('*');

  if (role !== 'admin' && role !== 'especial') {
    query = query.eq('user_id', user.id);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const workbook = new ExcelJS.Workbook();
  const templatePath = path.join(process.cwd(), 'templates', 'PLANILLA PARA REPARTOS-1.xlsx');
  
  try {
    await workbook.xlsx.readFile(templatePath);
    const worksheet = workbook.getWorksheet(1);
    const startingRow = 5;

    data.forEach((reparto, index) => {
      const currentRow = startingRow + index;
      const row = worksheet.getRow(currentRow);

      row.getCell('A').value = index + 1;
      row.getCell('B').value = reparto.destino;
      row.getCell('C').value = reparto.direccion;
      row.getCell('D').value = reparto.horarios;
      row.getCell('E').value = reparto.bultos;
      
      const templateRow = worksheet.getRow(startingRow);
      row.height = templateRow.height;
      for(let i = 1; i <= 5; i++) {
        row.getCell(i).style = templateRow.getCell(i).style;
      }
    });
    
    worksheet.getCell('C2').value = new Date();

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Repartos-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Error generando el archivo Excel: ' + err.message }, { status: 500 });
  }
}
