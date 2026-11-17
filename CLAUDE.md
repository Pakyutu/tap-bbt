# Catatan
- Setiap update data dashboard, perbarui juga tanggal di `status.json` (ditampilkan di menu utama sebagai Status data).
- Naikkan versi cache `V` di `sw.js` tiap deploy.
- Cek WL vs ST: data dari `tools/cekst_build.py --wl WL.xlsx [--byu WL_SA_BYU.xlsx] --pv raw_st_pv*.xlsx --sa raw_st_sp*.xlsx` -> `cekst-data.js`, update juga status.json.
- ST Digipos: `python3 tools/st_digipos.py <ST_DIGIPOS.xlsx>` (update kolom vr/vb/ss/sb D.O di digipos.html), lalu ganti label "update DD Nov" + D.VER.
- MoM Sales Tap (paste SURYA): `python3 tools/surya_mom.py <paste.txt> PV|SA <hari>`.
- Stock on Hand (paste SURYA): `python3 tools/surya_soh.py <paste.txt> PV|SA <hari_MTD> <hari_paste>`.
- Revenue Telkomsel per site (Monitoring Performance Region SUMBAGTENG): `python3 tools/site_rev.py <file.xlsx> "DD Nov"` (tanggal = Data Update di sheet SITE LEVEL).
